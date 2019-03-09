import { Model, Sequelize, ISequelizeConfig } from 'sequelize-typescript'
import { logger } from '../services'
import { seqModels } from '../models'

export interface IOptions {
    uri: string
    seqOptions?: ISequelizeConfig
}

/*
    This class was created to work with Sequelize as ORM, you can find more information
    regarding Sequelize here:
        http://docs.sequelizejs.com

    TODO: find documentation for Typescript
*/
class RDB {
    public sequelize: any | Sequelize
    public isConnected: boolean

    constructor() {
        this.isConnected = false
    }

    public async initAsync(options: IOptions) {
        this.sequelize = new Sequelize(options.uri)
        try {
            await this.sequelize.addModels(seqModels)
            /*
                Authenticate is called to test connection with DB
                Errors are caught in catch block and sync() is not exceuted
            */
            await this.sequelize.authenticate()
            logger.info('RDB => Authenticated')

            this.isConnected = true
        } catch (error) {
            /*
                Here you can find all the documentation for Sequelize errors:
                http://docs.sequelizejs.com/class/lib/errors/index.js~BaseError.html
            */
            logger.error(`RDB => ${error}`)
        }
    }
}

export const rdb: RDB = new RDB()
