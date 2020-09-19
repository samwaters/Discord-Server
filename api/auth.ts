import {ApiModule} from '../module'
import {Server} from '../index'
import {HttpUtils} from '../utils/http'
import * as qs from 'qs'

export default class AuthApi implements ApiModule {
  private server: Server

  constructor(server: Server) {
    this.server = server
  }

  private authCallback(req, res) {
    res.header('Content-Type', 'text/html').send(`<!doctype html>
<html>
  <head>
    <title>Redirecting</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { background-color: black; color: white; font-family: "Roboto"; margin:0; padding:0 10px; }
    </style>
  </head>
  <body>
    <h1>Validating...</h1>
    <p>Please wait while we verify your details</p>
    <script>
      const query = location.search.substr(1).split('&').reduce(
        (acc, cur) => {
          const kv = cur.split('=')
          acc[kv[0]] = kv[1]
          return acc
        },
        {}
      )
      window.opener.postMessage({...query, type: 'TOKEN_EVENT'}, '*')
      window.close()
    </script>
  </body>
</html>
`)
  }

  private authRedirect(req, res) {
    const url=`https://discord.com/oauth2/authorize?client_id=${this.server.config.clientId}&redirect_uri=${encodeURIComponent(this.server.config.redirectUri)}&response_type=${this.server.config.responseType}&scope=${this.server.config.scopes.join('%20')}&state=foobar`
    res.header('Content-Type', 'text/html').send(`<!doctype html>
<html>
  <head>
    <title>Redirecting</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;URL='${url}'" />
    <style>
      body { background-color: black; color: white; font-family: "Roboto"; margin:0; padding:0 10px; }
    </style>
  </head>
  <body>
    <h1>Redirecting to Discord...</h1>
    <p>Please wait while we redirect you to Discord</p>
  </body>
</html>
`)
  }

  private async getToken(req, res) {
    if(!req.body.token) {
      console.log(req.body)
      res.status(400).send({error: true, message: 'Missing token'}).end()
      return
    }
    try {
      const response = await HttpUtils.post(
        this.server.config.discordOAuthURL,
        qs.stringify({
          client_id: this.server.config.clientId,
          client_secret: this.server.config.clientSecret,
          code: req.body.token,
          grant_type: this.server.config.oauthGrantType,
          redirect_uri: this.server.config.redirectUri,
          scope: this.server.config.scopes.join('%20')
        })
      )
      res.send({
        ...response,
        createdAt: new Date().getTime()
      }).end()
    } catch(e) {
      console.log(e)
      console.log('TOKEN', req.body.token)
      console.log('-----\n\n\n\n-----')
      res.status(403).send({error: true, message: 'Could not get token'}).end()
    }
  }

  public async addRoutes() {
    this.server.registerRoute('/api/auth/callback', (req, res) => this.authCallback(req, res))
    this.server.registerRoute('/api/auth/redirect', (req, res) => this.authRedirect(req, res))
    this.server.registerRoute('/api/auth/token', (req, res) => this.getToken(req, res), 'post')
  }
}
