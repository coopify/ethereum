import { User, UserAttributes } from '../models'
import { logger, encryption } from '../services'

export async function getAsync(id: string): Promise<User | null> {
    try {
        const userInstance = await User.getAsync(id)

        return userInstance
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findAsync(where: object): Promise<User[] | null> {
    try {
        const userInstances = await User.getManyAsync(where)

        return userInstances
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function findOneAsync(where: object): Promise<User | null> {
    try {
        const userInstance = await User.getOneAsync(where)
        return userInstance
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}

export async function createAsync(body: UserAttributes): Promise<User | null> {
    try {
        body.pk = encryption.encryptString(body.pk)
        const userInstance = await User.createAsync(body)

        return userInstance
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}
