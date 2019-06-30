import * as Pusher from 'pusher'
import * as PusherClient from 'pusher-js'
import { logger, redisCache } from '../services'
import { server as config } from '../../../config'
import { AuthorizationInterface } from '../interfaces'
import { AuthorizationAttributes } from '../models'

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
    private channel: PusherClient.Channel

    constructor(options: IOptions) {
        this.isConnected = false
        this.pusher = new Pusher(options)
        const pusherClient = new PusherClient(options.key, { cluster: options.cluster })
        this.channel = pusherClient.subscribe('TransactionAuthorization')
        this.createChannel()
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

    private createChannel() {
        //This channel will wait for messages directly from FE to authorize each transaction.
        //We took this meassure in order to prevent someone with a token of the user
        //to make transactions for the user.
        this.channel.bind('authorize', async (data: AuthorizationAttributes) => {
            data.status = 'Waiting'
            await AuthorizationInterface.createAsync(data)
            logger.info(`Authorized transaction from user ${data.fromId} to ${data.toId}`)
        })
        this.channel.bind('cancel', async (data: AuthorizationAttributes) => {
            const authorization = await AuthorizationInterface.findOneAsync({ fromId: data.fromId, toId: data.toId, offerId: data.offerId, status: 'Waiting' })
            if (authorization) {
                await AuthorizationInterface.updateAsync(authorization, { status: 'Cancelled' })
                logger.info(`Someone cancelled the authorization from ${data.fromId} to ${data.toId}`)
            } else {
                logger.error(``)
            }
        })
    }
}
