import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { FindOptions, Op } from 'sequelize';
import User from './User';
import OrganizationMember from './OrganizationMember';
import OList from './OList';
import OrganizationList from './OrganizationList';
import { optArr } from '../lib/DbHelper';
import OTaskExecutor from './OTaskExecutor';

@Table({
  timestamps: false,
  underscored: true,
})
export default class Organization extends Model<Organization> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name: string;

  @AllowNull(false)
  @Default('')
  @Column(DataType.STRING(255))
  slogan: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  owner_id: number;

  @AllowNull(false)
  @Column(DataType.BIGINT({
    length: 13,
  }).UNSIGNED)
  created_at: number;

  @BelongsToMany(() => User, () => OrganizationMember)
  members: User[];

  @BelongsToMany(() => OList, () => OrganizationList)
  lists: OList[];

  @HasOne(() => OrganizationMember)
  settings: OrganizationMember;

  static async isCreator(organizationId: number, userId: number) {
    const role = await this.getRole(organizationId, userId);
    return role === 0;
  }

  static async isModerator(organizationId: number, userId: number) {
    const role = await this.getRole(organizationId, userId);
    return role <= 1;
  }

  static async getRole(organizationId: number, userId: number) {
    const settings = await OrganizationMember.findOne({
      where: {
        organization_id: organizationId,
        member_id: userId,
      },
    });
    return settings ? settings.role_id : -1;
  }

  static async getByPk(pk: number, userId: number) {
    const options: FindOptions = {
      include: [{
        model: User.scope('default'),
        through: {
          attributes: [],
        },
      }, {
        model: OrganizationMember,
        attributes: {
          exclude: [
            'id',
            'organization_id',
            'member_id',
          ],
        },
        where: {
          member_id: userId,
        },
      }],
    };

    return Organization.findByPk(pk, options);
  }

  static async createOrganization(name: string, userId: number) {
    const organization: Organization = await new Organization({
      name,
      owner_id: userId,
      created_at: Date.now(),
    }).save();
    await Promise.all([
      new OrganizationMember({
        organization_id: organization.id,
        member_id: userId,
        role_id: 0,
      }).save(),
      OList.createDefaultList(organization.id),
    ]);

    return Organization.getByPk(organization.id, userId);
  }

  static async getOrganizations(userId: number, opts: FindOptions) {
    let options: FindOptions = {
      include: [{
        model: OrganizationMember,
        attributes: {
          exclude: [
            'id',
            'organization_id',
            'member_id',
          ],
        },
        where: {
          member_id: userId,
        },
      }],
    };
    options = { ...options, ...opts };
    return Organization.findAll(options);
  }

  static async getMembers(organizationId: number, userIds: string = null) {
    const organization = await Organization.findByPk(organizationId, {
      include: [{
        model: User.scope('default'),
        where: {
          id: optArr(userIds),
        },
        through: {
          attributes: [],
        },
      }],
    });
    if (!organization) {
      return [];
    }
    const users = organization.members.map(u => u.id);
    const settings = await OrganizationMember.findAll({
      attributes: {
        exclude: [
          'id',
          'organization_id',
        ],
      },
      where: {
        member_id: users,
        organization_id: organizationId,
      },
    });
    return organization.members.map(m => {
      const id = settings.findIndex(s => s.member_id === m.id);
      const newSettings = settings[id];
      newSettings.member_id = undefined;
      return {
        ...m.toJSON(),
        settings: newSettings,
      };
    });
  }

  static async setRoles(organizationId: number, userIds: string, roleId: number) {
    await OrganizationMember.update({
      role_id: roleId,
    }, {
      where: {
        organization_id: organizationId,
        member_id: String(userIds).split(','),
      },
    });
    return this.getMembers(organizationId, userIds);
  }

  static async addMembers(organizationId: number, userIds: string, roleId: number) {
    const userIdsArr = String(userIds).split(',');
    await Promise.all(
      userIdsArr.map(async id => {
        try {
          await new OrganizationMember({
            organization_id: organizationId,
            member_id: id,
            role_id: roleId,
          }).save();
        } catch (e) {
          console.error(e);
        }
      }),
    );
    return this.getMembers(organizationId);
  }

  static async removeMembers(organizationId: number, userIds: string) {
    const userIdsArr = String(userIds).split(',');
    await OrganizationMember.destroy({
      where: {
        organization_id: organizationId,
        member_id: userIdsArr,
        role_id: {
          [Op.gte]: 1,
        },
      },
    });
    return this.getMembers(organizationId);
  }
}
