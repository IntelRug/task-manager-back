import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  HasMany, HasOne,
  Model,
  PrimaryKey, Scopes,
  Table,
} from 'sequelize-typescript';
import { FindOptions } from 'sequelize';
import OTask from './OTask';
import ErrorCode from '../lib/ErrorCode';
import OrganizationList from './OrganizationList';

@Scopes(() => ({
  default: {
    include: [{
      model: OTask,
    }],
  },
}))
@Table({
  timestamps: false,
  underscored: true,
})
export default class OList extends Model<OList> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name: string;

  @AllowNull(false)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  created_at: number;

  @HasMany(() => OTask)
  tasks: OTask[];

  @HasOne(() => OrganizationList)
  settings: OrganizationList;

  static async isAllowed(organizationId, listId) {
    const list: OList = await OList.scope('default').getByPk(organizationId, listId);
    // if (!list || list.settings.isOwner) {
    //   throw new ErrorCode(2);
    // }
    return list;
  }

  static async getByPk(organizationId: number, pk: number) {
    const options: FindOptions = {
      include: [{
        model: OrganizationList,
        attributes: {
          exclude: [
            'id',
            'organization_id',
            'list_id',
          ],
        },
        where: {
          organization_id: organizationId,
        },
      }],
    };

    return OList.scope('default').findByPk(pk, options);
  }

  static async getAvailableLists(organizationId, userId, opts) {
    let options: FindOptions = {
      include: [{
        model: OrganizationList,
        attributes: {
          exclude: [
            'id',
            'organization_id',
            'list_id',
          ],
        },
        where: {
          organization_id: organizationId,
        },
      }],
    };
    options = { ...options, ...opts };
    return OList
      .scope('default')
      .findAll(options);
  }

  static async getDefaultList(organizationId) {
    const organizationList: OrganizationList = await OrganizationList.findOne({
      where: {
        organization_id: organizationId,
        default: 1,
      },
    });
    if (!organizationList) {
      throw new ErrorCode(2);
    }
    return organizationList.list_id;
  }

  static async createDefaultList(organizationId: number) {
    const list: OList = await new OList({
      name: 'Несортированные',
      created_at: Date.now(),
    }).save();
    await new OrganizationList({
      list_id: list.id,
      organization_id: organizationId,
      default: 1,
    }).save();
    return OList.scope('default').getByPk(organizationId, list.id);
  }

  static async createList(organizationId: number, name: string) {
    const list: OList = await new OList({
      name,
      created_at: Date.now(),
    }).save();
    await new OrganizationList({
      list_id: list.id,
      organization_id: organizationId,
    }).save();
    return OList.scope('default').getByPk(organizationId, list.id);
  }

  static async deleteList(listId: number, moveTo: number) {
    if (moveTo) {
      await OList.moveTasks(listId, moveTo);
    }
    await OList.destroy({
      where: {
        id: listId,
      },
    });
  }

  static async moveTasks(listId, moveToListId) {
    return OTask.update({
      list_id: moveToListId,
    }, {
      where: {
        list_id: listId,
      },
    });
  }
}
