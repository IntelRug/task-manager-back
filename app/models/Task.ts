import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType, Default, DefaultScope,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript';
import User from './User';
import TaskExecutor from './TaskExecutor';
import ErrorCode from '../lib/ErrorCode';

@Table({
  timestamps: false,
  underscored: true,
})
@DefaultScope(() => ({
  include: [{
    model: User,
    through: {
      attributes: [],
    },
  }],
}))
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

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
  important: number;

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
  deadline_at: number;

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
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

  static async isAllowed(taskId, userId) {
    const task: Task = await Task.findByPk(taskId);
    if (!task || task.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return task;
  }

  static async isAllowedToEdit(taskId, userId) {
    const task: Task = await Task.findByPk(taskId);
    if (!task || task.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return task;
  }

  async finish(userId) {
    if (this.finished_at) throw new ErrorCode(300);
    this.status = 0;
    this.finished_at = Date.now();
    this.finished_by = userId;
    return this.save();
  }
}
