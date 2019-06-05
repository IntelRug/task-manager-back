import * as passport from 'passport';
import User from '../controllers/User';
import UTask from '../controllers/UTask';
import OTask from '../controllers/OTask';
import List from '../controllers/List';
import OList from '../controllers/OList';
import Organization from '../controllers/Organization';
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

    app.route(`${secure}/users`)
      .get(Validator.userGetMany, User.getMany);

    app.route(`${secure}/users/:userId`)
      .get(Validator.userGetOne, User.getOne);

    app.route(`${secure}/lists`)
      .get(Validator.listGetMany, List.getMany)
      .post(Validator.listCreate, List.create);

    app.route(`${secure}/lists/:listId`)
      .get(Validator.listGetOne, List.getOne)
      .delete(Validator.listDelete, List.delete)
      .put(Validator.listEdit, List.edit);

    app.route(`${secure}/tasks`)
      .get(Validator.taskGetMany, UTask.getMany)
      .post(Validator.taskCreate, UTask.create);

    app.route(`${secure}/tasks/:taskId`)
      .get(Validator.taskGetOne, UTask.getOne)
      .delete(Validator.taskDelete, UTask.delete)
      .put(Validator.taskEdit, UTask.edit);

    app.route(`${secure}/organizations`)
      .get(Organization.getMany)
      .post(Organization.create);

    app.route(`${secure}/organizations/:organizationId`)
      .get(Organization.getOne)
      .put(Organization.edit);

    app.route(`${secure}/organizations/:organizationId/lists`)
      .get(Validator.listGetMany, OList.getMany)
      .post(Validator.listCreate, OList.create);

    app.route(`${secure}/organizations/:organizationId/lists/:listId`)
      .get(Validator.listGetOne, OList.getOne)
      .delete(Validator.listDelete, OList.delete)
      .put(Validator.listEdit, OList.edit);

    app.route(`${secure}/organizations/:organizationId/tasks`)
      .get(Validator.taskGetMany, OTask.getMany)
      .post(Validator.taskCreate, OTask.create);

    app.route(`${secure}/organizations/:organizationId/tasks/:taskId`)
      .get(Validator.taskGetOne, OTask.getOne)
      .delete(Validator.taskDelete, OTask.delete)
      .put(Validator.taskEdit, OTask.edit);

    app.route(`${secure}/organizations/:organizationId/tasks/:taskId/executors`)
      .get(Validator.taskGetExecutors, OTask.getExecutors)
      .post(Validator.taskSetExecutors, OTask.setExecutors)
      .delete(Validator.taskRemoveExecutors, OTask.removeExecutors)
      .put(Validator.taskAddExecutors, OTask.addExecutors);

    app.route(`${secure}/organizations/:organizationId/members`)
      .get(Organization.getMembers)
      .put(Organization.addMembers)
      .delete(Organization.removeMembers);

    app.route(`${secure}/organizations/:organizationId/members/role`)
      .put(Organization.setRoles);
  }
}
