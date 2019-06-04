import { FindOptions } from 'sequelize';
import validate from '../lib/ValidateDecorator';
import ErrorHelper from '../lib/ErrorHelper';
import List from '../models/List';
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
      const list = await List.createList(req.user.id, req.body.name);
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const list = await List.isAllowed(req.params.listId, req.user.id);
      await List.deleteList(req.user.id, list.id, req.body.move_to);
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
