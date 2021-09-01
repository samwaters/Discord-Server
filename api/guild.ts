import { ApiModule } from '../module'
import { Server } from '../index'
import { hasPermission, Permissions } from '../utils/permissions'

export default class GuildApi implements ApiModule {
  private server: Server

  constructor (server: Server) {
    this.server = server
  }

  private async checkAuth (state, token, userId) {
    const user = await this.server.redis.get(`users.${userId}`)
    if (!user) return false
    const userData = JSON.parse(user)
    return userData.state === state && userData.token === token
  }

  private async getGuild (req, res) {
    if (!req.body.guild) {
      res.status(400).send({ error: true, message: 'Missing guild id' }).end()
      return
    }
    const authCheck = this.checkAuth(req.headers['x-token'], req.headers.authorization, req.headers['x-user'])
    if (!authCheck) {
      res.status(403).send({ error: true, message: 'Access Denied' }).end()
      return
    }
    const guilds = await this.server.redis.get(`users.${req.headers['x-user']}.guilds`)
    if (!guilds) {
      res.status(404).send({ error: true, message: 'Guild not found' }).end()
      return
    }
    const guildData = JSON.parse(guilds)
    if (!guildData[req.body.guild] || !hasPermission(guildData[req.body.guild].permissions, Permissions.ADMINISTRATOR)) {
      res.status(403).send({ error: true, message: 'Access Denied', reason: 'NO_PERMISSION' }).end()
      return
    }
    res.send({
      modules: [
        {
          description: 'Hilarious Dad Jokes',
          enabled: false,
          id: 1,
          name: 'Dad Jokes',
        },
        {
          description: 'Multi-player quiz',
          enabled: false,
          id: 2,
          name: 'Quiz',
        },
        {
          description: 'Guild Raffle',
          enabled: false,
          id: 3,
          name: 'Raffle',
        },
        {
          description: 'Trial Management',
          enabled: false,
          id: 4,
          name: 'Trial Planner',
        },
      ],
    }).end()
  }

  private async selectGuild (req, res) {
    if (!req.body.guild) {
      res.status(400).send({ error: true, message: 'Missing guild id' }).end()
      return
    }
    const authCheck = this.checkAuth(req.headers['x-token'], req.headers.authorization, req.headers['x-user'])
    if (!authCheck) {
      res.status(403).send({ error: true, message: 'Access Denied' }).end()
      return
    }
    const guilds = await this.server.redis.get(`users.${req.headers['x-user']}.guilds`)
    if (!guilds) {
      res.status(404).send({ error: true, message: 'Guild not found' }).end()
      return
    }
    const guildData = JSON.parse(guilds)
    if (!guildData[req.body.guild]) {
      res.status(400).send({ error: true, message: 'Not a member of that guild' }).end()
      return
    }
    const settings = await this.server.redis.get(`users.${req.headers['x-user']}.settings`)
    const settingsObj = settings ? JSON.parse(settings) : {}
    settingsObj.lastSelectedGuildId = req.body.guild
    await this.server.redis.set(
      `users.${req.headers['x-user']}.settings`,
      JSON.stringify(settingsObj),
    )
    res.send({ guild: req.body.guild }).end()
  }

  public async addRoutes () {
    this.server.registerRoute('/api/guild', (req, res) => this.getGuild(req, res), 'post')
    this.server.registerRoute('/api/guild/select', (req, res) => this.selectGuild(req, res), 'post')
  }
}
