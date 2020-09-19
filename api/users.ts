import {ApiModule} from '../module'
import {Server} from '../index'
import {HttpUtils} from '../utils/http'

export default class UsersApi implements ApiModule {
  private server: Server
  constructor(server: Server) {
    this.server = server
  }

  private async usersMe(req, res) {
    if(!req.headers.authorization) {
      res.status(401)
        .send({error: true, message: 'Access Denied'})
        .end()
      return
    }
    try {
      const me = await HttpUtils.authenticatedGet(
        this.server.config.discordApiURL + '/users/@me',
        req.headers.authorization
      )
      const guilds = await HttpUtils.authenticatedGet(
        this.server.config.discordApiURL + '/users/@me/guilds',
        req.headers.authorization
      )
      res.send({
        ...me,
        guilds
      }).end()
    } catch(e) {
      console.log(e)
      res.status(403)
        .send({error: true, message: 'Access Denied'})
        .end()
    }
  }

  public async addRoutes() {
    this.server.registerRoute('/api/users/me', (req, res) => this.usersMe(req, res))
  }
}
