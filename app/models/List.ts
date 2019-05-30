import {
  AfterBulkRestore,
  AllowNull,
  AutoIncrement, BeforeBulkCreate, BeforeConnect, BeforeCreate, BeforeFind,
  Column,
  DataType,
  ForeignKey, HasMany,
  Model,
  PrimaryKey, Scopes,
  Table,
} from 'sequelize-typescript';
import User from './User';
import Task from './Task';
import ErrorCode from '../lib/ErrorCode';

@Scopes(() => ({
  default: {
    include: [Task],
  },
}))
@Table({
  timestamps: false,
  underscored: true,
})
export default class List extends Model<List> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  owner_id: number;

  @AllowNull(false)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  created_at: number;

  @HasMany(() => Task)
  tasks: Task[];

  static async isAllowed(taskId, userId) {
    const list: List = await List.findByPk(taskId);
    if (!list || list.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return list;
  }

  static async getDefaultList(userId) {
    const list: List = await List.findOne({
      where: {
        owner_id: userId,
      },
    });
    if (!list) {
      throw new ErrorCode(2);
    }
    return list.id;
  }

  static async moveTasks(listId, moveToListId) {
    return Task.update({
      list_id: moveToListId,
    }, {
      where: {
        list_id: listId,
      },
    });
  }
}
