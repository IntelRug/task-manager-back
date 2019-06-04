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
import OList from './OList';
import Organization from './Organization';

@Table({
  timestamps: false,
  underscored: true,
})
export default class OrganizationList extends Model<OrganizationList> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id: number;

  @AllowNull(false)
  @ForeignKey(() => OList)
  @Column(DataType.INTEGER.UNSIGNED)
  list_id: number;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER.UNSIGNED)
  organization_id: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.TINYINT({
    length: 1,
  }).UNSIGNED)
  default: number;
}
