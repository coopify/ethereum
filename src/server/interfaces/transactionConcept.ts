import { TransactionDescription, ConceptAttributes } from '../models'
import { logger } from '../services'

export async function getAsync(id: string): Promise<TransactionDescription | null> {
    try {
        const transactionDescription = await TransactionDescription.getAsync(id)

        return transactionDescription
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findAsync(where: object): Promise<TransactionDescription[] | null> {
    try {
        const transactionDescriptions = await TransactionDescription.getManyAsync(where)

        return transactionDescriptions
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findOneAsync(where: object): Promise<TransactionDescription | null> {
    try {
        const transactionDescription = await TransactionDescription.getOneAsync(where)
        return transactionDescription
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function createAsync(body: ConceptAttributes): Promise<TransactionDescription | null> {
    try {
        const transactionDescription = await TransactionDescription.createAsync(body)

        return transactionDescription
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}
