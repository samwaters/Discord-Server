export interface ServerConfig {
  clientId: string
  clientSecret: string
  discordApiURL: string
  discordOAuthURL: string
  oauthGrantType: string
  redirectUri: string
  redisHost: string
  redisPort: number
  responseType: string
  scopes: string[]
}

export const config:ServerConfig = {
  clientId: '722393293182337124',
  clientSecret: '2a4QuolUqPqF1lFMaBk4p0fzhJgC5FSB',
  discordApiURL: 'https://discord.com/api/v6/',
  discordOAuthURL: 'https://discord.com/api/oauth2/token',
  oauthGrantType: 'authorization_code',
  redirectUri: 'http://localhost:8080/api/auth/callback',
  redisHost: 'localhost',
  redisPort: 6379,
  responseType: 'code',
  scopes: ['identify', 'guilds', 'email']
}
