import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType, Default, ForeignKey,
  Model,
  PrimaryKey, Table,
} from 'sequelize-typescript';
import User from './User';
import ErrorCode from '../lib/ErrorCode';
import UList from './UList';
import UserList from './UserList';

@Table({
  timestamps: false,
  underscored: true,
})
export default class UTask extends Model<UTask> {
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

  @ForeignKey(() => UList)
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

  static async isAllowed(taskId: number, userId: number) {
    const task: UTask = await UTask.getByPk(taskId);
    const userList = await UserList.findOne({
      where: {
        user_id: userId,
        list_id: task.list_id,
      },
    });
    if (!userList) {
      throw new ErrorCode(2);
    }
    return task;
  }

  static async isAllowedToEdit(taskId: number, userId: number) {
    const task: UTask = await UTask.getByPk(taskId);
    const userList = await UserList.findOne({
      where: {
        user_id: userId,
        list_id: task.list_id,
      },
    });
    if (!userList) {
      throw new ErrorCode(2);
    }
    return task;
  }

  static async getByPk(taskId) {
    return UTask.findByPk(taskId);
  }

  async finish(userId) {
    if (this.finished_at) throw new ErrorCode(300);
    this.status = 0;
    this.finished_at = Date.now();
    this.finished_by = userId;
    return this.save();
  }
}
