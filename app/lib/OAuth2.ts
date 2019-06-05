import * as oauth2orize from 'oauth2orize';
import * as passport from 'passport';
import { Op } from 'sequelize';
import AuthService from './AuthService';
import AccessToken from '../models/AccessToken';
import User from '../models/User';

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(
  async (client, username, password, scope, done) => {
    try {
      const user = await User
        .findOne({
          where: {
            [Op.or]: {
              email: username,
              username,
            },
          },
        });

      if (!user) return done(null, false);
      if (!AuthService.checkSaltHash(password, user.salt, user.hash)) return done(null, false);

      const accessToken = await new AccessToken({
        token: await AuthService.createToken(),
        client_id: client.id,
        user_id: user.id,
        created_at: Date.now(),
      }).save();
      return done(null, accessToken.token, false, { expires_in: accessToken.expires_in, user_id: user.id });
    } catch (e) {
      return done(e);
    }
  },
));

// token endpoint
export default [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];
