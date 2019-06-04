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
import OTask from './OTask';
import User from './User';

@Table({
  timestamps: false,
  underscored: true,
})
export default class OTaskExecutor extends Model<OTaskExecutor> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => OTask)
  @Column(DataType.BIGINT.UNSIGNED)
  task_id: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  executor_id: number;
}
