import * as passport from 'passport';
import User from '../controllers/User';
import Task from '../controllers/Task';
import Validator from '../lib/Validator';
import OAuth2 from '../lib/OAuth2';

export default class Routes {
  public static routes(app): void {
    const secure = '/method';

    app.route('/oauth/token')
      .post(OAuth2);
    app.route('/register')
      .post(Validator.register, User.create);
    app.route(`${secure}/*`)
      .all(passport.authenticate('bearer', { session: false }));

    app.route(`${secure}/tasks`)
      .get(Validator.taskGetMany, Task.getMany)
      .post(Validator.taskCreate, Task.create);

    app.route(`${secure}/tasks/:taskId`)
      .get(Validator.taskGetOne, Task.getOne)
      .delete(Validator.taskDelete, Task.delete)
      .put(Validator.taskEdit, Task.edit);

    app.route(`${secure}/tasks/:taskId/status`)
      .put(Validator.taskSetStatus, Task.setStatus);

    app.route(`${secure}/tasks/:taskId/executors`)
      .get(Validator.taskGetExecutors, Task.getExecutors)
      .post(Validator.taskSetExecutors, Task.setExecutors)
      .delete(Validator.taskRemoveExecutors, Task.removeExecutors)
      .put(Validator.taskAddExecutors, Task.addExecutors);

    app.route(`${secure}/tasks/:taskId/finish`)
      .put(Validator.taskFinish, Task.setFinished);
  }
}
