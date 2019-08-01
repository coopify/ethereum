import { pusher, cryptoClient, logger, encryption } from './services'
import { User } from './models'
import { ConceptInterface, UserInterface } from './interfaces'
import { ErrorPayload } from './errorPayload'

export async function makePayment(amount: number, fromEth: User, toEth: User, offer: any, proposal: any, concept: string) {
    if (!fromEth || !toEth) { throw new Error('User not found') }
    try {
        const fromTokenBalance = await cryptoClient.getBalanceAsync(fromEth.address)
        if (fromTokenBalance < amount) {
            logger.info(`You have ${fromTokenBalance} coopies and want to expend ${amount}`)
            throw new ErrorPayload(403, `You have ${fromTokenBalance} coopies and want to expend ${amount}`)
        }
        const decryptedPK = encryption.decryptString(fromEth.pk)
        const result = await cryptoClient.transferCoopiesAsync(toEth.address, amount, fromEth.address, decryptedPK)
        await paymentSuccess(result, fromEth, toEth, offer, proposal, concept)
        const fromBalance = await cryptoClient.getFuelBalanceAsync(fromEth.address)
        if (fromBalance && fromBalance < 400000) {
            logger.info(`Detected low fuel for user ${fromEth.userId}`)
            cryptoClient.addFreeFuelAmountAsync(fromEth.address, 800000)
        }
    } catch (error) {
        logger.error(`Something went wrong ${JSON.stringify(error)} -  ${error}`)
        try {
            await paymentFailure(fromEth, toEth, offer, proposal)
            const fromBalance = await cryptoClient.getFuelBalanceAsync(fromEth.address)
            if (fromBalance && fromBalance < 400000) {
                logger.info(`Detected low fuel for user ${fromEth.userId}`)
                cryptoClient.addFreeFuelAmountAsync(fromEth.address, 800000)
            }
        } catch (horribleError) {
            //TODO: log this on the db or sommething similar
            logger.error(`¡¡¡Something went horribly wrong ${JSON.stringify(horribleError)} -  ${horribleError}!!!`)
        }
    }
}

export async function processReward(amount: number, toEth: User, concept: string) {
    if (!toEth) { throw new Error('User not found') }
    try {
        const result = await cryptoClient.transferCoopiesAsync(toEth.address, amount)
        await ConceptInterface.createAsync({
            toId: toEth.id,
            systemTransaction: true,
            transactionConcept: concept,
            transactionHash: result.transactionHash,
        })
        logger.info(`Added reward coopies to account => ${toEth.address}`)
    } catch (error) {
        //TODO: log this on the db or sommething similar
        logger.error(`¡¡¡Something went horribly wrong ${JSON.stringify(error)}!!!`)
    }
}

async function paymentSuccess(result: any, from: any, to: any, offer: any, proposal: any, conceptText: string) {
    logger.info(`Result => ${JSON.stringify(result)}`)
    try {
        const concept = await ConceptInterface.createAsync({
            fromId: from.id,
            toId: to.id,
            offerId: offer.id,
            proposalId: proposal.id,
            systemTransaction: false,
            transactionConcept: conceptText,
            transactionHash: result.transactionHash,
        })
        logger.info(`Concept => ${JSON.stringify(concept)}`)
        pusher.sendSuccessMessageAsync({
            fromId: from.id,
            toId: to.id,
            proposalId: proposal.id,
        })
    } catch (error) {
        logger.error(`Error while processing a succesfull transaction => ${JSON.stringify(error)} -  ${error}`)
        throw new ErrorPayload(500, 'Error')
    }
}

async function paymentFailure(from: any, to: any, offer: any, proposal: any) {
    pusher.sendFailureMessageAsync({
        fromId: from.id,
        toId: to.id,
        proposalId: proposal.id,
    })
}

export async function getUserTransactionsAsync(user: User) {
    const rawTransactions = await cryptoClient.getTransactionsByAccount(user.address)
    const transactionsHashes = rawTransactions.result.map((t) => t.hash)
    const transactionsWithConcept = await ConceptInterface.findAsync({ transactionHash: { $in: transactionsHashes } })
    if (!transactionsWithConcept) { throw new ErrorPayload(500, 'Failed to get transactions') }
    const transactions: any[] = await Promise.all(
        rawTransactions.result.map(async (rawT) => {
            const transactionConcept = transactionsWithConcept.find((t) => rawT.hash === t.transactionHash)
            if (transactionConcept) {
                return {
                    date: transactionConcept.createdAt,
                    coopies: rawT.value,
                    from: transactionConcept.from && !transactionConcept.systemTransaction ? transactionConcept.from.userId : 'Coopify',
                    to: transactionConcept.to.userId,
                    inOut: rawT.from === user.address.toLowerCase() ? 'out' : 'in',
                    proposalId: transactionConcept.proposalId,
                    description: transactionConcept.transactionConcept,
                }
            } else {
                const fromUser = user
                const toUser = await UserInterface.findOneAsync({ address: rawT.to })
                if (toUser) {
                    return {
                        date: rawT.timestamp,
                        coopies: rawT.value,
                        from: rawT.from === fromUser.address.toLowerCase() ? fromUser.userId : toUser.userId,
                        to: rawT.to === toUser.address.toLowerCase() ? toUser.userId : fromUser.userId,
                        inOut: rawT.from === fromUser.address.toLowerCase() ? 'out' : 'in' ,
                    }
                } else {
                    logger.error(`Could not find transaction => ${rawT.hash}`)
                }
            }
        })

    )
    return transactions.filter((t) => t != null)
}

export async function signUpAsync(user: User) {
    const transaction = await cryptoClient.transferCoopiesAsync(user.address, 40) //TODO DOUBLE/TRIPLE CHECK THIS VALUES
    await ConceptInterface.createAsync({
        toId: user.id,
        systemTransaction: true,
        transactionConcept: 'Initial amount register',
        transactionHash: transaction.transactionHash,
    })
    logger.info(`Added coopies to account => ${user.address}`)
    await cryptoClient.addFreeFuelAmountAsync(user.address, 8000000) //TODO DOUBLE/TRIPLE CHECK THIS VALUES
}
