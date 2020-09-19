export interface ServerConfig {
  clientId: string
  clientSecret: string
  discordApiURL: string
  discordOAuthURL: string
  oauthGrantType: string
  redirectUri: string
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
  responseType: 'code',
  scopes: ['identify', 'guilds', 'email']
}
