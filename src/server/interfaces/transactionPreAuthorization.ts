import { AuthorizationAttributes, TransactionPreAuthorization, AuthorizationUpdateAttributes } from '../models'
import { logger } from '../services'

export async function getAsync(id: string): Promise<TransactionPreAuthorization | null> {
    try {
        const transactionAuthorization = await TransactionPreAuthorization.getAsync(id)

        return transactionAuthorization
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findAsync(where: object): Promise<TransactionPreAuthorization[] | null> {
    try {
        const transactionAuthorizations = await TransactionPreAuthorization.getManyAsync(where)

        return transactionAuthorizations
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findOneAsync(where: object): Promise<TransactionPreAuthorization | null> {
    try {
        const transactionAuthorization = await TransactionPreAuthorization.getOneAsync(where)
        return transactionAuthorization
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function createAsync(body: AuthorizationAttributes): Promise<TransactionPreAuthorization | null> {
    try {
        const transactionAuthorization = await TransactionPreAuthorization.createAsync(body)

        return transactionAuthorization
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function updateAsync(instance: TransactionPreAuthorization, body: AuthorizationUpdateAttributes): Promise<TransactionPreAuthorization | null> {
    try {
        const transactionAuthorization = await TransactionPreAuthorization.updateAsync(instance, body)

        return transactionAuthorization
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}
