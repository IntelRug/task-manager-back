import {
  AllowNull,
  AutoIncrement, BelongsToMany,
  Column,
  DataType,
  ForeignKey, HasMany,
  Model,
  PrimaryKey, Scopes, Sequelize,
  Table,
} from 'sequelize-typescript';
import { FindOptions } from 'sequelize';
import User from './User';
import Task from './Task';
import ErrorCode from '../lib/ErrorCode';
import UserList from './UserList';

@Scopes(() => ({
  default: {
    include: [{
      model: Task,
    }],
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

  @BelongsToMany(() => User, () => UserList)
  members: User[];

  @HasMany(() => UserList)
  settings: UserList;

  static async isAllowed(taskId, userId) {
    const list: List = await List.findByPk(taskId);
    if (!list || list.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return list;
  }

  static async getAvailableLists(userId, opts) {
    let options: FindOptions = {
      include: [{
        model: UserList,
        attributes: {
          exclude: [
            'id',
            'user_id',
            'list_id',
          ],
        },
        where: {
          user_id: userId,
        },
      }],
    };
    options = { ...options, ...opts };
    const lists = await List
      .scope('default')
      .findAll(options);

    return lists.map(list => (
      { ...list.toJSON(), settings: list.settings[0].toJSON() }
    ));
  }

  static async getDefaultList(userId) {
    const userList: UserList = await UserList.findOne({
      where: {
        user_id: userId,
        default: 1,
      },
    });
    if (!userList) {
      throw new ErrorCode(2);
    }
    return userList.list_id;
  }

  static async createDefaultList(userId) {
    const list: List = await new List({
      name: 'Несортированные',
      owner_id: userId,
      created_at: Date.now(),
    }).save();
    await new UserList({
      list_id: list.id,
      user_id: userId,
      default: 1,
    }).save();
    return list;
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
