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
      const settings = await(this.server.redis.get(`users.${me.id}.settings`))
      const settingsObj = settings ? JSON.parse(settings) : {
        lastSelectedGuildId: guilds ? guilds[0].id : 0
      }
      await this.server.redis.set(
        `users.${me.id}`,
        JSON.stringify({
          state: req.headers['x-token'],
          token: req.headers.authorization
        }),
        43200
      )
      await this.server.redis.set(
        `users.${me.id}.guilds`,
        JSON.stringify(
          guilds.reduce((acc, cur) => {
            acc[cur.id] = { permissions: cur.permissions }
            return acc
          }, {})
        ),
        43200
      )
      res.send({
        ...me,
        ...settingsObj,
        guilds: guilds.reduce((acc, cur) => { acc[cur.id] = cur; return acc; }, {})
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
