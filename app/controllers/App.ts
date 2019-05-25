import Client from '../models/Client';

export default class AppController {
  public static async get(req, res) {
    try {
      const client = await Client.findByPk(req.params.appId);
      if (!client) res.status(400).send();
      res.send({ app: client });
    } catch (e) {
      res.status(500).send();
    }
  }

  public static async create(req, res) {
    try {
      const client = await new Client({
        name: req.body.name,
        description: req.body.description,
        ownerId: req.user.id,
        created_at: Date.now(),
      }).save();
      res.send({ app: client });
    } catch (e) {
      res.status(500).send(e);
    }
  }
}
