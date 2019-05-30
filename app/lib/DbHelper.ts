import { Op } from 'sequelize';

export function optInt(field: any) {
  return field || { [Op.not]: null };
}

export function optArr(field: any) {
  return field ? field.split(',') : { [Op.not]: null };
}
