import { FindOptions } from 'sequelize';
import validate from '../lib/ValidateDecorator';
import ErrorHelper from '../lib/ErrorHelper';
import { optArr } from '../lib/DbHelper';
import OList from '../models/OList';

export default class ListController {
  @validate
  public static async getOne(req, res) {
    try {
      await OList.isAllowed(req.params.listId, req.user.id);
      const list = await OList.scope('default').findByPk(req.params.listId);
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
      const lists = await OList.getAvailableLists(req.params.organizationId, req.user.id, options);
      res.send({ lists });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async create(req, res) {
    try {
      const list = await OList.createList(req.user.id, req.body.name);
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const list = await OList.isAllowed(req.params.organizationId, req.params.listId);
      await OList.deleteList(list.id, req.body.move_to);
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async edit(req, res) {
    try {
      const list = await OList.isAllowed(req.params.organizationId, req.params.listId);
      list.name = req.body.name ? req.body.name : list.name;
      await list.save();
      res.send({ list });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
