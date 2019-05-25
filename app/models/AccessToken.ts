import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType, Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({
  timestamps: false,
  underscored: true,
})
export default class AccessToken extends Model<AccessToken> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT.UNSIGNED)
  id: number;

  @AllowNull(true)
  @Column(DataType.BIGINT.UNSIGNED)
  user_id: number;

  @AllowNull(false)
  @Column(DataType.BIGINT.UNSIGNED)
  client_id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(96))
  token: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER.UNSIGNED)
  expires_in: number;

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

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
  device: number;
}
