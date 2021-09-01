import { ApiModule } from '../module'
import { Server } from '../index'
import { authCallback, authRedirect, getToken } from './auth/discordAuth'
import { checkRedisAuth } from './auth/redisAuth'

export default class AuthApi implements ApiModule {
  private server: Server

  constructor (server: Server) {
    this.server = server
  }

  private async validateToken (req, res) {
    if (!req.body.token || !req.body.state) {
      res.send({ valid: false }).end()
      return
    }
    const authCheck = await checkRedisAuth({
      ip: req.headers.remote,
      state: req.body.state,
      token: req.body.token,
    }, this.server)
    res
      .status(authCheck ? 200 : 403)
      .send({ ok: authCheck })
      .end()
  }

  public async addRoutes () {
    this.server.registerRoute('/api/auth/callback', (req, res) => authCallback(req, res))
    this.server.registerRoute('/api/auth/redirect', (req, res) => authRedirect(req, res, this.server))
    this.server.registerRoute('/api/auth/token', (req, res) => getToken(req, res, this.server), 'post')
    this.server.registerRoute('/api/auth/validate', this.validateToken)
  }
}
