import { Request, Response } from 'express';
import { FindOptions } from 'sequelize';
import Organization from '../models/Organization';
import ErrorHelper from '../lib/ErrorHelper';
import { optArr } from '../lib/DbHelper';

export default class OrganizationController {
  public static async getOne(req, res) {
    try {
      const organization = await Organization.getByPk(req.params.organizationId, req.user.id);
      res.send({ organization });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async getMany(req, res) {
    const options: FindOptions = {
      where: {
        id: optArr(req.query.ids),
      },
    };

    try {
      const organizations = await Organization.getOrganizations(req.user.id, options);
      res.send({ organizations });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async create(req, res) {
    try {
      const organization = await Organization
        .createOrganization(req.body.name, req.user.id);
      res.send({ organization });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async edit(req, res) {

  }

  public static async getMembers(req, res) {
    try {
      const members = await Organization
        .getMembers(req.params.organizationId);
      res.send({ members });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
