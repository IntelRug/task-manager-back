import { FindOptions } from 'sequelize';
import ErrorHelper from '../lib/ErrorHelper';
import OTask from '../models/OTask';
import User from '../models/User';
import validate from '../lib/ValidateDecorator';
import { optInt, optArr } from '../lib/DbHelper';
import OList from '../models/OList';

export default class OTaskController {
  @validate
  public static async getOne(req, res) {
    try {
      const task = await OTask.isAllowed(req.params.taskId, req.user.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async getMany(req, res) {
    const options: FindOptions = {
      where: {
        list_id: optInt(req.query.list_id),
        id: optArr(req.query.ids),
      },
      include: [{
        model: User.scope('default'),
        through: {
          attributes: [],
        },
      }],
    };

    try {
      const { count, rows } = await OTask.findAndCountAll(options);
      res.send({ count, tasks: rows });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async create(req, res) {
    try {
      const listId: number = req.body.list_id ? req.body.list_id
        : await OList.getDefaultList(req.user.id);
      let task: OTask = await new OTask({
        name: req.body.name,
        description: req.body.description,
        owner_id: req.user.id,
        status: req.body.status,
        important: req.body.important,
        list_id: listId,
        deadline_at: req.body.deadline_at,
        created_at: Date.now(),
      }).save();
      task = await OTask.findByPk(task.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const task = await OTask.isAllowedToEdit(req.params.taskId, req.user.id);
      await task.destroy();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async edit(req, res) {
    try {
      const task = await OTask.isAllowedToEdit(req.params.taskId, req.user.id);
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
  public static async getExecutors(req, res) {
    try {
      await OTask.isAllowed(req.params.taskId, req.user.id);
      const { count, rows: executors } = await OTask.getExecutors(req.params.taskId);
      res.send({ count, executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async addExecutors(req, res) {
    try {
      await OTask.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await OTask.addWithUserIdsArray(req.params.taskId, userIds);
      const { count, rows: executors } = await OTask.getExecutors(req.params.taskId);
      res.send({ count, executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async removeExecutors(req, res) {
    try {
      await OTask.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await OTask.removeWithUserIdsArray(req.params.taskId, userIds);
      const { count, rows: executors } = await OTask.getExecutors(req.params.taskId);
      res.send({ count, executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setExecutors(req, res) {
    try {
      await OTask.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await OTask.setWithUserIdsArray(req.params.taskId, userIds);
      const { count, rows: executors } = await OTask.getExecutors(req.params.taskId);
      res.send({ count, executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setFinished(req, res) {
    try {
      let task = await OTask.isAllowed(req.params.taskId, req.user.id);
      task = await task.finish(req.user.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
