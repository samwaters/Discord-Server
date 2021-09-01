import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { ApiModule } from './module'
import { ServerConfig } from './config/config'
import { ILogger, Logger, LogLevel } from './utils/logger'
import { IRedis, Redis } from './utils/redis'

export interface Server {
  config: ServerConfig
  addHeaders(): void
  addStaticRoutes(): void
  connectToRedis() : void
  loadModules(): void
  logger: ILogger
  redis: IRedis
  registerRoute(path: string, fn: (req, res, next?) => void, method?: string): void
  start(port: number|string): void
}

class WebServer implements Server {
  private server: express.Application
  public config: ServerConfig
  public logger: ILogger
  public redis: IRedis

  constructor () {
    const args = require('yargs')
      .default({
        clientid: process.env.CLIENTID,
        clientsecret: process.env.CLIENTSECRET,
        loglevel: process.env.LOGLEVEL || LogLevel[LogLevel.INFO],
      })
      .argv
    this.logger = new Logger(LogLevel[args.loglevel] as any)
    if (!args.clientsecret || !args.clientid) {
      this.logger.error('No client id or client secret provided! Please provide both --clientid and --clientsecret, or set CLIENTID and CLIENTSECRET as environment variables')
      process.exit(1)
    }
    this.server = express()
    this.config = require('./config/config').config
    this.config.clientId = args.clientid
    this.config.clientSecret = args.clientsecret
  }

  public addHeaders () {
    this.server.use(bodyParser.json())
    this.server.use((req, res, next) => {
      res.header({
        'Access-Control-Allow-Headers': 'authorization, content-type, x-token, x-user',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      })
      next()
    })
  }

  public addStaticRoutes () {
    this.server.use(express.static('dist'))
  }

  public connectToRedis () {
    this.logger.debug('Connecting to redis')
    this.redis = new Redis(this, this.config.redisHost, this.config.redisPort)
  }

  public loadModules () {
    const files = fs.readdirSync(path.join(__dirname, 'api'))
    files.filter(file => file.endsWith('.ts')).forEach(file => {
      this.logger.info(`Registering ${file}`)
      const Module = require(path.join(__dirname, 'api', file)).default
      const apiModule: ApiModule = new Module(this)
      apiModule.addRoutes()
    })
  }

  public registerRoute (path: string, fn: (req, res, next?) => void, method: string = 'get') {
    this.server[method](path, fn)
  }

  public start (port: number|string) {
    this.logger.info(`Web server listening on port ${port}`)
    this.server.listen(port)
  }
}

const server = new WebServer()
server.addHeaders()
server.loadModules()
server.addStaticRoutes()
server.connectToRedis()
server.start(process.env.WEB_PORT || 8080)
