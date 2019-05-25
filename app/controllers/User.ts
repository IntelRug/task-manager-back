import { Request, Response } from 'express';
import { FindOptions, Op } from 'sequelize';
import AuthService from '../lib/AuthService';
import Organization from '../models/Organization';
import User from '../models/User';
import Task from '../models/Task';
import validate from '../lib/ValidateDecorator';
import ErrorHelper from '../lib/ErrorHelper';

export default class UserController {
  public static get(req: Request, res: Response) {
    const options: FindOptions = {
      include: [
        {
          model: Organization,
          through: {
            attributes: [],
          },
        },
        {
          model: Task,
          through: {
            attributes: [],
          },
        },
      ],
      where: {
        id: req.params.id,
      },
    };

    User
      .findOne(options)
      .then(user => {
        res.status(200).send({ user });
      });
  }

  @validate
  public static async create(req: Request, res: Response) {
    try {
      const existingUser: User = await User
        .findOne({
          where: {
            [Op.or]: {
              email: req.body.email,
              username: req.body.username,
            },
          },
        });

      if (existingUser) return res.status(400).send({ code: 28, message: 'User already exist' });

      const user: User = new User();

      const { salt, hash } = await AuthService.createSaltHash(req.body.password);

      user.email = req.body.email;
      user.username = req.body.username;
      user.last_name = req.body.last_name;
      user.first_name = req.body.first_name;
      user.salt = salt;
      user.hash = hash;
      user.created_at = Date.now();

      await user.save();
      return res.send({ user });
    } catch (e) {
      return ErrorHelper.api(res, e);
    }
  }
}
