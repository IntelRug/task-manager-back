import { Request, Response } from 'express';
import { FindOptions } from 'sequelize';
import Organization from '../models/Organization';
import User from '../models/User';

export default class OrganizationController {
  public static get(req: Request, res: Response) {
    const options: FindOptions = {
      include: [{
        model: User,
        attributes: [
          'id',
          'username',
        ],
        through: {
          attributes: [],
        },
      }],
      where: {
        id: req.params.id,
      },
    };

    Organization
      .findOne(options)
      .then(organization => {
        res.status(200).send({ organization });
      });
  }

  // public static create(req: Request, res: Response){
  //
  // }
}
