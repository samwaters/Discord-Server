import { Server } from '../../index'

interface AuthParameters {
  ip: string
  state: string
  token: string
}

const checkRedisAuth = async (auth: AuthParameters, server:Server) => {
  const redisAuth = await server.redis.get(auth.token)
  if (!redisAuth) return false
  try {
    const decodedAuth = JSON.parse(redisAuth)
    return decodedAuth.ip === auth.ip && decodedAuth.state === auth.state
  } catch {
    return false
  }
}

const setRedisAuth = async (token, state, ip, server:Server) => {
  await server.redis.set(token, JSON.stringify({ state, ip }), 300)
}

export { checkRedisAuth, setRedisAuth }
