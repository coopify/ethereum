import * as Pusher from 'pusher'
import { logger } from '../services'
import { server as config } from '../../../config'

export interface ITransaction {
    toId: string,
    fromId: string,
    proposalId: string,
}

interface IOptions {
    appId: string,
    key: string,
    secret: string,
    cluster: string,
    useTLS: boolean,
}

export class PusherService {
    private pusher: Pusher
    private isConnected: boolean

    constructor(options: IOptions) {
        this.isConnected = false
        this.pusher = new Pusher(options)
        logger.info('Pusher => Connected')
    }

    public async sendSuccessMessageAsync(message: ITransaction) {
        if (config.environment === 'test') { return }
        logger.info(`Sending transaction success message to ${message.toId} from ${message.fromId}`)
        return this.pusher.trigger('TransactionResponse', 'success', message)
    }

    public async sendFailureMessageAsync(message: ITransaction) {
        if (config.environment === 'test') { return }
        logger.info(`Sending transaction failure message to ${message.toId} from ${message.fromId}`)
        return this.pusher.trigger('TransactionResponse', 'failure', message)
    }
}
