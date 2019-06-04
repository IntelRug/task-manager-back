import {
  AllowNull,
  AutoIncrement, BelongsToMany,
  Column,
  DataType,
  ForeignKey, HasMany, HasOne,
  Model,
  PrimaryKey, Scopes,
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

  @HasOne(() => UserList)
  settings: UserList;

  static async isAllowed(listId, userId) {
    const list: List = await List.scope('default').getByPk(userId, listId);
    if (!list || list.owner_id !== userId) {
      throw new ErrorCode(2);
    }
    return list;
  }

  static async getByPk(userId, pk: number) {
    const options: FindOptions = {
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
    return List.scope('default').findByPk(pk, options);
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
    return List
      .scope('default')
      .findAll(options);
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
    return List.scope('default').getByPk(userId, list.id);
  }

  static async createList(userId, name) {
    const list: List = await new List({
      name,
      owner_id: userId,
      created_at: Date.now(),
    }).save();
    await new UserList({
      list_id: list.id,
      user_id: userId,
    }).save();
    return List.scope('default').getByPk(userId, list.id);
  }

  static async deleteList(userId, listId: number, moveTo: number) {
    if (moveTo) {
      await List.moveTasks(listId, moveTo);
    }
    await List.destroy({
      where: {
        id: listId,
      },
    });
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
