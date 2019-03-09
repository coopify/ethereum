import { LoggerConfigs } from './wLogger'
import { ServerConfigs } from './server'
import { RDBConfigs } from './rdb'
import { RedisConfigs } from './redis'

const wLogger = new LoggerConfigs()
const server = new ServerConfigs()
const redis = new RedisConfigs()
const rdb = new RDBConfigs()

export function validateAll() {
    return [
        wLogger.validate(),
        server.validate(),
        rdb.validate(),
        redis.validate(),
      ].filter((x) => x.hasErrors)
}

export { wLogger, server, redis, rdb }
