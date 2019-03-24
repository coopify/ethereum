import { Logger } from './wLogger'
import { redisCache, ClientParams } from './redisCache'
import { rdb, IOptions as RDBOptions } from './rdb'
import { EthereumWeb3 } from './web3'
import { IResolver } from './IResolver'
import * as config from '../../../config'

var logger: Logger
let cryptoClient: IResolver

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

export { logger, redisCache, rdb, cryptoClient }
