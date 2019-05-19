import { NextFunction, Request, Response } from 'express'
import { UserInterface, ConceptInterface } from '../interfaces'
import { logger, cryptoClient } from '../services'
import { User } from '../models'
import { ErrorPayload } from '../errorPayload'
import * as moment from 'moment'
import { makePayment, getUserTransactionsAsync, signUpAsync, processReward } from '../cryptoHandler'

/**
 * This function loads the user that matchs with userId (request query) into response.locals.user
 */
export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
    try {
        const user =  await UserInterface.findOneAsync({ userId: id })

        if (!user) { return response.status(404).json(new Error('User not found')) }

        response.locals.user = user
        next()
    } catch (error) {
        logger.error(error)
        response.status(400).json(new Error(error))
    }
}

export async function makePaymentAsync(request: Request, response: Response) {
    try {
        const { from, to, amount, offer, proposal, concept } = request.body
        if (!to || !from || !amount || !offer || !proposal || !concept) { throw new Error('Missing required fields') }
        const toEth = await UserInterface.findOneAsync({ userId: to.id })
        const fromEth = await UserInterface.findOneAsync({ userId: from.id })
        if (!toEth || !fromEth ) { throw new Error('User not found') }
        makePayment(amount, fromEth, toEth, offer, proposal, concept)
        response.status(200)
        response.send()
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

export async function processRewardAsync(request: Request, response: Response) {
    try {
        const { to, amount, concept } = request.body
        if (!to || !amount || !concept) { throw new Error('Missing required fields') }
        const toEth = await UserInterface.findOneAsync({ userId: to.id })
        if (!toEth ) { throw new Error('User not found') }
        processReward(amount, toEth, concept)
        response.status(200)
        response.send()
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

export async function getAccountBalance(request: Request, response: Response) {
    try {
        const user: User = response.locals.user
        //TODO: Continue with the refactor of the cryptohandler
        const balance = await cryptoClient.getBalanceAsync(user.address)
        response.status(200)
        response.send({ balance })
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

export async function getAccountTransactionsAsync(request: Request, response: Response) {
    try {
        const user: User = response.locals.user
        const transactions = await getUserTransactionsAsync(user)
        response.status(200)
        response.send(transactions)
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

function dtoRawTransactions(rawTransactions, requester: User, users: User[]): any[] {
    return rawTransactions.result.map((t) => {
        const dateString = moment.unix(t.timeStamp).format('MM/DD/YYYY')
        const otherUserAddress = t.from === requester.address.toLowerCase() ? t.from : t.to
        let otherUser: any = users.find((u) => u.address.toLowerCase() === otherUserAddress)
        if (!otherUser) { otherUser = { userId: 'Coopify' } }
        const coopies = t.value //Overwite the value before returning it
        return {
            date: dateString,
            coopies,
            from: t.from === requester.address.toLowerCase() ? requester.userId : otherUser.userId,
            to: t.to === requester.address.toLowerCase() ? requester.userId : otherUser.userId,
            inOut: t.to === requester.address.toLowerCase() ? 'in' : 'out',
        }
    })
}

export async function signupAsync(request: Request, response: Response, next: NextFunction) {
    try {
        const userId = request.body.userId
        if (!userId) { throw new Error('Missing required fields') }
        //TODO: Continue with the refactor of the cryptohandler
        const account = cryptoClient.createAccountAsync()
        const user = await UserInterface.createAsync({ address: account.address, pk: account.privateKey, userId })
        if (!user) { throw new Error('User not found') }
        signUpAsync(user)
        response.status(200)
        response.send()
    } catch (error) {
        logger.error(error)
        response.status(400).json(new ErrorPayload(400, error))
    }
}
