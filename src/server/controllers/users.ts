import { NextFunction, Request, Response } from 'express'
import { UserInterface } from '../interfaces'
import { logger, cryptoClient } from '../services'
import { User } from '../models'
import { ErrorPayload } from '../errorPayload'
import * as moment from 'moment'

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
        const { toId, amount } = request.body
        if (!toId) { throw new Error('Missing required fields') }
        const to = await UserInterface.findOneAsync({ userId: toId })
        const user: User | null = response.locals.user
        if (!user || !to ) { throw new Error('User not found') }
        const transacion = await cryptoClient.transferCoopiesAsync(to.address,  amount, user.address, user.pk)
        response.status(200)
        response.send({ transacion })
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

export async function getAccountBalance(request: Request, response: Response) {
    try {
        const user: User = response.locals.user
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
        const rawTransactions = await cryptoClient.getTransactionsByAccount(user.address)
        const walletsAddresses = rawTransactions.result.map((t) => t.from !== user.address ? t.from : t.to)
        const usersInvolved = await UserInterface.findAsync({ address: { $in: walletsAddresses } })
        if (!usersInvolved) { throw new ErrorPayload(500, 'Server error') }
        const transactions = dtoRawTransactions(rawTransactions, user, usersInvolved)
        logger.info(`RETURNED Transactions => ${JSON.stringify(transactions)}`)
        response.status(200)
        response.send(transactions)
    } catch (error) {
        logger.error(error + JSON.stringify(error))
        response.status(400).json(new Error(error))
    }
}

function dtoRawTransactions(rawTransactions, requester: User, users: User[]): any[] {
    return rawTransactions.result.map((t) => {
        const dateString = moment.unix(t.timeStamp).format("MM/DD/YYYY")
        const otherUserAddress = t.from === requester.address.toLowerCase() ? t.from : t.to
        let otherUser: any = users.find((u) => u.address.toLowerCase() === otherUserAddress)
        if (!otherUser) { otherUser = { userId: 'Coopify' } }
        const coopies = t.value //Overwite the value before returning it
        return {
            date: dateString,
            coopies,
            from: t.from === requester.address.toLowerCase() ? requester.userId : otherUser.userId,
            to: t.to === requester.address.toLowerCase() ? requester.userId : otherUser.userId,
            inOut: t.to === requester.address.toLowerCase() ? 'in' : 'out'
        }
    })
}

export async function signupAsync(request: Request, response: Response, next: NextFunction) {
    try {
        const userId = request.body.userId
        if (!userId) { throw new Error('Missing required fields') }
        const account = cryptoClient.createAccountAsync()
        const user = await UserInterface.createAsync({ address: account.address, pk: account.privateKey, userId })
        if (!user) { throw new Error('User not found') }
        await cryptoClient.transferCoopiesAsync(user.address, 40) //TODO DOUBLE/TRIPLE CHECK THIS VALUES
        await cryptoClient.addFreeFuelAmountAsync(user.address, 40000) //TODO DOUBLE/TRIPLE CHECK THIS VALUES
        const balance = await cryptoClient.getBalanceAsync(user.address)
        response.status(200).json(balance)
    } catch (error) {
        logger.error(error)
        response.status(400).json(new ErrorPayload(400, error))
    }
}
