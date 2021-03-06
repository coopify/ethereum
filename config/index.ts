import { LoggerConfigs } from './wLogger'
import { ServerConfigs } from './server'
import { RDBConfigs } from './rdb'
import { RedisConfigs } from './redis'
import { Web3Configs } from './web3'
import { PusherConfigs } from './pusher'
import { EncryptConfigs } from './encrypt'

const wLogger = new LoggerConfigs()
const server = new ServerConfigs()
const redis = new RedisConfigs()
const rdb = new RDBConfigs()
const web3 = new Web3Configs()
const pusher = new PusherConfigs()
const encrypt = new EncryptConfigs()

export function validateAll() {
    return [
        wLogger.validate(),
        server.validate(),
        rdb.validate(),
        redis.validate(),
        web3.validate(),
        pusher.validate(),
        encrypt.validate(),
      ].filter((x) => x.hasErrors)
}

export { wLogger, server, redis, rdb, web3, pusher, encrypt }
