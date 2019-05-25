import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Default,
  DefaultScope,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import Organization from './Organization';
import OrganizationMember from './OrganizationMember';
import TaskExecutor from './TaskExecutor';
import Task from './Task';
import UserList from './UserList';
import List from './List';

@Table({
  timestamps: false,
  underscored: true,
})
@DefaultScope(() => ({
  attributes: {
    exclude: [
      'salt',
      'hash',
      'email',
    ],
  },
}))
export default class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(255))
  username: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  first_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  last_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(96))
  hash: string;

  @AllowNull(false)
  @Column(DataType.STRING(96))
  salt: string;

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
  activity_at: number;

  @BelongsToMany(() => Organization, () => OrganizationMember)
  organizations: Organization[];

  @BelongsToMany(() => Task, () => TaskExecutor)
  tasks: Task[];

  @BelongsToMany(() => List, () => UserList)
  lists: List[];
}
