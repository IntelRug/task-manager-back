import { Op } from 'sequelize';

export function optInt(field: any) {
  return field || { [Op.not]: null };
}

export function optArr(field: any) {
  return field ? String(field).split(',') : { [Op.not]: null };
}
