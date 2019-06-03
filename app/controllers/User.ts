import { Request, Response } from 'express';
import { FindOptions, Op } from 'sequelize';
import AuthService from '../lib/AuthService';
import User from '../models/User';
import validate from '../lib/ValidateDecorator';
import ErrorHelper from '../lib/ErrorHelper';
import { optArr } from '../lib/DbHelper';
import List from '../models/List';

export default class UserController {
  public static async getOne(req, res) {
    try {
      const user = await User
        .scope('default')
        .findByPk(req.params.userId);

      res.send({ user });
    } catch (e) {
      console.error(e);
    }
  }

  public static async getMany(req, res) {
    const options: FindOptions = {
      where: {
        id: optArr(req.query.ids),
      },
    };
    try {
      const { count, rows: users } = await User
        .scope('default')
        .findAndCountAll(options);

      res.send({ count, users });
    } catch (e) {
      console.error(e);
    }
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

      let user: User = new User();

      const { salt, hash } = await AuthService.createSaltHash(req.body.password);

      user.email = req.body.email;
      user.username = req.body.username;
      user.last_name = req.body.last_name;
      user.first_name = req.body.first_name;
      user.salt = salt;
      user.hash = hash;
      user.created_at = Date.now();

      user = await user.save();
      user = await User.scope('default').findByPk(user.id);
      await List.createDefaultList(user.id);
      return res.send({ user });
    } catch (e) {
      return ErrorHelper.api(res, e);
    }
  }
}
