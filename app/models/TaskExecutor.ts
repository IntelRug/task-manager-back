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
}
