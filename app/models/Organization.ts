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
import { FindOptions } from 'sequelize';
import User from './User';
import OrganizationMember from './OrganizationMember';
import OList from './OList';
import OrganizationList from './OrganizationList';

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

  static async getMembers(organizationId: number) {
    const organization = await Organization.findByPk(organizationId, {
      include: [{
        model: User.scope('default'),
        through: {
          attributes: [],
        },
      }],
    });
    return organization.members;
  }
}
