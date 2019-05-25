import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import * as crypto from 'crypto';
import * as util from 'util';
import User from '../models/User';
import Client from '../models/Client';
import AccessToken from '../models/AccessToken';

const cryptoPbkdf2 = util.promisify(crypto.pbkdf2);

export default class AuthService {
  public static async createSaltHash(password) {
    const salt = crypto.randomBytes(48).toString('base64');
    const hash = (await cryptoPbkdf2(password, salt, 10, 48, 'sha512')).toString();
    return { salt, hash };
  }

  public static async checkSaltHash(password, salt, hash) {
    if (!password || !hash || !salt) return false;
    const userHash = (await cryptoPbkdf2(password, salt, 10, 48, 'sha512')).toString();
    return userHash === hash;
  }

  public static createToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(48, async (err, buffer) => {
        const newToken = buffer.toString('hex');
        try {
          const accessToken = await AccessToken
            .findOne({
              where: {
                token: newToken,
              },
            });

          resolve(accessToken ? await this.createToken() : newToken);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  public static init() {
    /**
     * LocalStrategy
     *
     * This strategy is used to authenticate users based on a username and password.
     * Anytime a request is made to authorize an application, we must ensure that
     * a user is logged in before asking them to approve the request.
     */
    passport.use(new LocalStrategy(
      async (username, password, done) => {
        try {
          const user = await User.findOne({
            where: {
              $or: {
                username,
                email: username,
              },
            },
          });

          if (!user) return done(null, false);
          if (!await this.checkSaltHash(password, user.salt, user.hash)) return done(null, false);
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      },
    ));

    /**
     * BasicStrategy & ClientPasswordStrategy
     *
     * These strategies are used to authenticate registered OAuth clients. They are
     * employed to protect the `token` endpoint, which consumers use to obtain
     * access tokens. The OAuth 2.0 specification suggests that clients use the
     * HTTP Basic scheme to authenticate. Use of the client password strategy
     * allows clients to send the same credentials in the request body (as opposed
     * to the `Authorization` header). While this approach is not recommended by
     * the specification, in practice it is quite common.
     */
    async function verifyClient(clientId, clientSecret, done) {
      try {
        const client = await Client.findByPk(clientId);
        if (!client) return done(null, false);
        if (client.secret !== clientSecret) return done(null, false);
        return done(null, client);
      } catch (e) {
        return done(e);
      }
    }

    passport.use(new BasicStrategy(verifyClient));
    passport.use(new ClientPasswordStrategy(verifyClient));

    /**
     * BearerStrategy
     *
     * This strategy is used to authenticate either users or clients based on an access token
     * (aka a bearer token). If a user, they must have previously authorized a client
     * application, which is issued an access token to make requests on behalf of
     * the authorizing user.
     */
    passport.use(new BearerStrategy(
      async (accessToken, done) => {
        try {
          const token = await AccessToken
            .findOne({
              where: {
                token: accessToken,
              },
            });
          if (!token) return done(null, false);
          token.activity_at = Date.now();
          token.save();
          if (token.user_id) {
            const user = await User.findByPk(token.user_id);
            user.activity_at = Date.now();
            user.save();
            if (!user) return done(null, false);
            // To keep this example simple, restricted scopes are not implemented,
            // and this is just for illustrative purposes.
            return done(null, user, { scope: '*' });
          }
          // The request came from a client only since userId is null,
          // therefore the client is passed back instead of a user.
          const client = await Client.findByPk(token.client_id);
          if (!client) return done(null, false);
          // To keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes.
          return done(null, client, { scope: '*' });
        } catch (e) {
          return done(e);
        }
      },
    ));
  }
}
