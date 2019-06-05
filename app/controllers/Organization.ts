import { Request, Response } from 'express';
import { FindOptions } from 'sequelize';
import Organization from '../models/Organization';
import ErrorHelper from '../lib/ErrorHelper';
import { optArr } from '../lib/DbHelper';
import ErrorCode from "../lib/ErrorCode";

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
        .getMembers(req.params.organizationId, req.query.user_ids);
      res.send({ members });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async setRoles(req, res) {
    try {
      if (!await Organization.isModerator(req.params.organizationId, req.user.id)) {
        throw new ErrorCode(2);
      }
      const userIdsArr = String(req.body.user_ids).split(',');
      if (userIdsArr.indexOf(String(req.user.id)) !== -1) {
        throw new ErrorCode(2);
      }
      const members = await Organization
        .setRoles(req.params.organizationId, req.body.user_ids, req.body.role_id);
      res.send({ members });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async addMembers(req, res) {
    try {
      if (!await Organization.isModerator(req.params.organizationId, req.user.id)) {
        throw new ErrorCode(2);
      }
      if (req.body.role_id === 0) {
        throw new ErrorCode(2);
      }
      const members = await Organization
        .addMembers(req.params.organizationId, req.body.user_ids, req.body.role_id);
      res.send({ members });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }

  public static async removeMembers(req, res) {
    try {
      if (!await Organization.isModerator(req.params.organizationId, req.user.id)) {
        throw new ErrorCode(2);
      }
      const members = await Organization
        .removeMembers(req.params.organizationId, req.body.user_ids);
      res.send({ members });
    } catch (e) {
      ErrorHelper.api(res, e);
    }
  }
}
