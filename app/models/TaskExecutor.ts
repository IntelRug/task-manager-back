import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import Task from './Task';
import User from './User';

@Table({
  timestamps: false,
  underscored: true,
})
export default class TaskExecutor extends Model<TaskExecutor> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Task)
  @Column(DataType.BIGINT.UNSIGNED)
  task_id: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  executor_id: number;

  static async addWithUserIdsArray(taskId: number, userIds: number[], filtered = false) {
    let add: number[] = [];
    if (!filtered) {
      const task = await Task.findByPk(taskId);
      const currentExecutors: number[] = task.executors.map(e => e.id);
      add = userIds.filter(id => !currentExecutors.includes(id));
    } else {
      add = userIds;
    }
    add.forEach(async id => {
      try {
        await new TaskExecutor({
          task_id: taskId,
          executor_id: id,
        }).save();
      } catch (e) {
        console.error(e);
      }
    });
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
    const task = await Task.findByPk(taskId);
    const currentExecutors: number[] = task.executors.map(e => e.id);
    const add: number[] = userIds.filter(id => !currentExecutors.includes(id));
    const remove: number[] = currentExecutors.filter(id => !userIds.includes(id));
    await Promise.all([
      TaskExecutor.removeWithUserIdsArray(taskId, remove),
      TaskExecutor.addWithUserIdsArray(taskId, add, true),
    ]);
  }
}
