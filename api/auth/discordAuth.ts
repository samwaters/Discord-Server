import * as qs from 'qs'
import { HttpUtils } from '../../utils/http'

const authCallback = (req, res) => {
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

const authRedirect = (req, res, server) => {
  if (!req.query || !req.query.state) {
    res.status(400).send({ error: true, message: 'No state provided' }).end()
    return
  }
  const url = `https://discord.com/oauth2/authorize?client_id=${server.config.clientId}&redirect_uri=${encodeURIComponent(server.config.redirectUri)}&response_type=${server.config.responseType}&scope=${server.config.scopes.join('%20')}&state=${req.query.state}`
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

const getToken = async (req, res, server) => {
  if (!req.body.token || !req.body.state) {
    res.status(400).send({ error: true, message: 'Missing token or state' }).end()
  }
  try {
    const response = await HttpUtils.post(
      server.config.discordOAuthURL,
      qs.stringify({
        client_id: server.config.clientId,
        client_secret: server.config.clientSecret,
        code: req.body.token,
        grant_type: server.config.oauthGrantType,
        redirect_uri: server.config.redirectUri,
        scope: server.config.scopes.join('%20'),
      }),
    )
    console.log('STORE ME IN REDIS!!!!!!')
    console.log(response)
    res.send({
      ...response,
      createdAt: new Date().getTime(),
    }).end()
  } catch {
    res.status(401).send({ error: true, message: 'Could not get token' }).end()
  }
}

export { authCallback, authRedirect, getToken }
