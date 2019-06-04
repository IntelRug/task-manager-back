import { FindOptions } from 'sequelize';
import ErrorHelper from '../lib/ErrorHelper';
import UTask from '../models/UTask';
import User from '../models/User';
import validate from '../lib/ValidateDecorator';
import { optInt, optArr } from '../lib/DbHelper';
import UList from '../models/UList';

export default class UTaskController {
  @validate
  public static async getOne(req, res) {
    try {
      const task = await UTask.isAllowed(req.params.taskId, req.user.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async getMany(req, res) {
    const options: FindOptions = {
      where: {
        owner_id: req.user.id,
        list_id: optInt(req.query.list_id),
        id: optArr(req.query.ids),
      },
    };

    try {
      const tasks = await UTask.findAll(options);
      res.send({ tasks });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async create(req, res) {
    try {
      const listId: number = req.body.list_id ? req.body.list_id
        : await UList.getDefaultList(req.user.id);
      let task: UTask = await new UTask({
        name: req.body.name,
        description: req.body.description,
        owner_id: req.user.id,
        status: req.body.status,
        important: req.body.important,
        list_id: listId,
        created_at: Date.now(),
      }).save();
      task = await UTask.findByPk(task.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const task = await UTask.isAllowedToEdit(req.params.taskId, req.user.id);
      await task.destroy();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async edit(req, res) {
    try {
      const task = await UTask.isAllowedToEdit(req.params.taskId, req.user.id);
      task.name = req.body.name ? req.body.name : task.name;
      task.description = req.body.description ? req.body.description : task.description;
      task.status = Object.prototype.hasOwnProperty.call(req.body, 'status')
        ? req.body.status : task.status;
      task.deadline_at = req.body.deadline_at ? req.body.deadline_at : task.deadline_at;
      task.important = Object.prototype.hasOwnProperty.call(req.body, 'important')
        ? req.body.important : task.important;
      task.list_id = req.body.list_id ? req.body.list_id : task.list_id;
      task.finished_at = !task.finished_at && task.status === 3 ? Date.now() : task.finished_at;
      task.finished_by = !task.finished_by && task.status === 3 ? req.user.id : task.finished_by;
      task.updated_at = Date.now();
      await task.save();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setFinished(req, res) {
    try {
      let task = await UTask.isAllowed(req.params.taskId, req.user.id);
      task = await task.finish(req.user.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
