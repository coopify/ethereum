import { Logger } from './wLogger'
import { redisCache, ClientParams } from './redisCache'
import { rdb, IOptions as RDBOptions } from './rdb'
import { EthereumWeb3 } from './web3'
import { IResolver } from './IResolver'
import { PusherService } from './pusher'
import { EncryptionHandlerService } from './encryptionHandler'
import * as config from '../../../config'

let logger: Logger
let cryptoClient: IResolver
let pusher: PusherService
let encryption: EncryptionHandlerService

export  function initExternalServices() {

    /*
        Initializing Redis instance for auth token hosting
    */
    const redisOpt: ClientParams = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    }

    redisCache.init(redisOpt)

    /*
        Initializing relational Database Connection
        Sequelize used as ORM
        TODO: Docker
    */
    const rdbOpt: RDBOptions = {
        uri : config.rdb.getConnectionString(),
    }

    rdb.initAsync(rdbOpt)

    cryptoClient = new EthereumWeb3(config.web3)

    pusher = new PusherService({
        appId: config.pusher.appId,
        cluster: config.pusher.cluster,
        useTLS: true,
        key: config.pusher.apikey,
        secret: config.pusher.secret,
    })

    encryption = new EncryptionHandlerService(config.encrypt)
}

/*
    We use Winston for logging
    defined levels are: error and info
    TODO: expand levels
*/
export function initWLogger() {
    const logLevel = config.wLogger.isValid ? config.wLogger.level : 'info'
    logger = new Logger(logLevel)
}

export { logger, redisCache, rdb, cryptoClient, pusher, encryption }
