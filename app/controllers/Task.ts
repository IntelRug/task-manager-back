import { FindOptions } from 'sequelize';
import ErrorHelper from '../lib/ErrorHelper';
import Task from '../models/Task';
import User from '../models/User';
import validate from '../lib/ValidateDecorator';
import TaskExecutor from '../models/TaskExecutor';

export default class TaskController {
  @validate
  public static async getOne(req, res) {
    try {
      const task = await Task.findByPk(req.params.taskId);
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
      },
      include: [{
        model: User,
        through: {
          attributes: [],
          where: {
            executor_id: req.user.id,
          },
        },
      }],
    };

    if (req.query.ids) {
      Object.defineProperty(options.where, 'id', req.query.ids.split(','));
    }

    try {
      const { count, rows } = await Task.findAndCountAll(options);
      res.send({ count, tasks: rows });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async create(req, res) {
    try {
      let task: Task = await new Task({
        name: req.body.name,
        description: req.body.description,
        owner_id: req.user.id,
        created_at: Date.now(),
      }).save();
      task = await Task.findByPk(task.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async delete(req, res) {
    try {
      const task = await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      await task.destroy();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async edit(req, res) {
    try {
      const task = await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      task.name = req.body.name ? req.body.name : task.name;
      task.description = req.body.description ? req.body.description : task.description;
      task.status = req.body.status ? req.body.status : task.status;
      task.deadline_at = req.body.deadlineAt ? req.body.deadlineAt : task.deadline_at;
      task.finished_at = req.body.finishedAt ? req.body.finishedAt : task.finished_at;
      await task.save();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setStatus(req, res) {
    try {
      const task = await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      task.status = req.body.status;
      await task.save();
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async getExecutors(req, res) {
    try {
      const task: Task = await Task.isAllowed(req.params.taskId, req.user.id);
      res.send({ executors: task.executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async addExecutors(req, res) {
    try {
      await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await TaskExecutor.addWithUserIdsArray(req.params.taskId, userIds);
      const task = await Task.findByPk(req.params.taskId);
      res.send({ executors: task.executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async removeExecutors(req, res) {
    try {
      await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await TaskExecutor.removeWithUserIdsArray(req.params.taskId, userIds);
      const task = await Task.findByPk(req.params.taskId);
      res.send({ executors: task.executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setExecutors(req, res) {
    try {
      await Task.isAllowedToEdit(req.params.taskId, req.user.id);
      const userIds: number[] = String(req.body.user_ids)
        .split(',')
        .map(id => parseInt(id, 10));
      await TaskExecutor.setWithUserIdsArray(req.params.taskId, userIds);
      const task = await Task.findByPk(req.params.taskId);
      res.send({ executors: task.executors });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  @validate
  public static async setFinished(req, res) {
    try {
      let task = await Task.isAllowed(req.params.taskId, req.user.id);
      task = await task.finish(req.user.id);
      res.send({ task });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
