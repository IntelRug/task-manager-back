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
import User from './User';
import Organization from './Organization';

@Table({
  timestamps: false,
  underscored: true,
})
export default class OrganizationMember extends Model<OrganizationMember> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER.UNSIGNED)
  organization_id: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  member_id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  roleId: number;
}
