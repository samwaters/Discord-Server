import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import {ApiModule} from './module'
import {ServerConfig} from './config/config'

export interface Server {
  config: ServerConfig
  addHeaders(): void
  addStaticRoutes(): void
  loadModules(): void
  registerRoute(path: string, fn: (req, res, next?) => void, method?: string): void
  start(port: number|string): void
}

class WebServer implements Server {
  private server: express.Application
  public config: ServerConfig
  constructor() {
    this.server = express()
    this.config = require('./config/config').config
  }

  public addHeaders() {
    this.server.use(bodyParser.json())
    this.server.use((req, res, next) => {
      res.header({
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
      next()
    })
  }

  public addStaticRoutes() {
    this.server.use(express.static('dist'))
  }

  public loadModules() {
    const files = fs.readdirSync(path.join(__dirname, 'api'))
    files.filter(file => file.endsWith('.ts')).forEach(file => {
      console.log(`Registering ${file}`)
      const module = require(path.join(__dirname, 'api', file)).default
      const apiModule: ApiModule = new module(this)
      apiModule.addRoutes()
    })
  }

  public registerRoute(path: string, fn: (req, res, next?) => void, method: string = 'get') {
    this.server[method](path, fn)
  }

  public start(port: number|string) {
    console.log('Web server listening on port', port)
    this.server.listen(port)
  }
}

const server = new WebServer()
server.addHeaders()
server.loadModules()
server.addStaticRoutes()
server.start(process.env.WEB_PORT || 8080)
