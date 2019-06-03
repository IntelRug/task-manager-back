import { FindOptions } from 'sequelize';
import validate from '../lib/ValidateDecorator';
import ErrorHelper from '../lib/ErrorHelper';
import List from '../models/List';
import UserList from '../models/UserList';
import { optArr } from '../lib/DbHelper';

export default class ListController {
  @validate
  public static async getOne(req, res) {
    try {
      await List.isAllowed(req.params.listId, req.user.id);
      const list = await List.scope('default').findByPk(req.params.listId);
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async getMany(req, res) {
    const options: FindOptions = {
      where: {
        id: optArr(req.query.ids),
      },
    };

    try {
      const lists = await List.getAvailableLists(req.user.id, options);
      res.send({ lists });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async create(req, res) {
    try {
      let list: List = await new List({
        name: req.body.name,
        owner_id: req.user.id,
        created_at: Date.now(),
      }).save();
      await new UserList({
        list_id: list.id,
        user_id: req.user.id,
      }).save();
      list = await List.scope('default').findByPk(list.id);
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const list = await List.isAllowed(req.params.listId, req.user.id);
      if (req.body.move_to) {
        await List.moveTasks(req.params.listId, req.body.move_to);
      }
      await list.destroy();
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async edit(req, res) {
    try {
      const list = await List.isAllowed(req.params.listId, req.user.id);
      list.name = req.body.name ? req.body.name : list.name;
      await list.save();
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
