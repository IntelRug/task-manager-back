import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType, Default, ForeignKey,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript';
import User from './User';
import TaskExecutor from './TaskExecutor';
import ErrorCode from '../lib/ErrorCode';
import List from './List';

@Table({
  timestamps: false,
  underscored: true,
})
export default class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT.UNSIGNED)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name: string;

  @AllowNull(false)
  @Default('')
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  owner_id: number;

  @ForeignKey(() => List)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  list_id: number;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.INTEGER.UNSIGNED)
  important: number;

  @AllowNull(true)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  deadline_at: number;

  @AllowNull(true)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  finished_at: number;

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
  finished_by: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.TINYINT)
  status: number;

  @AllowNull(false)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  created_at: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  updated_at: number;

  @BelongsToMany(() => User, () => TaskExecutor)
  executors: User[];

  static async isAllowed(taskId: number, userId: number) {
    const task: Task = await Task.getByPk(taskId);
    if (!task || task.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return task;
  }

  static async isAllowedToEdit(taskId: number, userId: number) {
    const task: Task = await Task.getByPk(taskId);
    if (!task || task.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return task;
  }

  static async getByPk(taskId) {
    return Task.findByPk(taskId, {
      include: [{
        model: User.scope('default'),
        through: {
          attributes: [],
        },
      }],
    });
  }

  static async getExecutors(taskId: number) {
    return User.scope('default').findAndCountAll({
      include: [{
        model: TaskExecutor,
        attributes: [],
        where: {
          task_id: taskId,
        },
      }],
    });
  }

  static async addWithUserIdsArray(taskId: number, userIds: number[], filtered = false) {
    let add: number[] = [];
    if (!filtered) {
      const { rows: executors } = await Task.getExecutors(taskId);
      const currentExecutors: number[] = executors.map(e => e.id);
      add = userIds.filter(id => !currentExecutors.includes(id));
    } else {
      add = userIds;
    }
    await Promise.all(
      add.map(async id => {
        try {
          await new TaskExecutor({
            task_id: taskId,
            executor_id: id,
          }).save();
        } catch (e) {
          console.error(e);
        }
      }),
    );
  }

  static async removeWithUserIdsArray(taskId: number, userIds: number[]) {
    await TaskExecutor.destroy({
      where: {
        task_id: taskId,
        executor_id: userIds,
      },
    });
  }

  static async setWithUserIdsArray(taskId: number, userIds: number[]) {
    const { rows: executors } = await Task.getExecutors(taskId);
    const currentExecutors: number[] = executors.map(e => e.id);
    const add: number[] = userIds.filter(id => !currentExecutors.includes(id));
    const remove: number[] = currentExecutors.filter(id => !userIds.includes(id));
    await Promise.all([
      Task.removeWithUserIdsArray(taskId, remove),
      Task.addWithUserIdsArray(taskId, add, true),
    ]);
  }

  async finish(userId) {
    if (this.finished_at) throw new ErrorCode(300);
    this.status = 0;
    this.finished_at = Date.now();
    this.finished_by = userId;
    return this.save();
  }
}
