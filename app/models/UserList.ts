import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType, Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import List from './List';
import User from './User';

@Table({
  timestamps: false,
  underscored: true,
})
export default class UserList extends Model<UserList> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @ForeignKey(() => List)
  @Column(DataType.INTEGER.UNSIGNED)
  list_id: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  user_id: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.TINYINT({
    length: 1,
  }).UNSIGNED)
  default: number;
}
