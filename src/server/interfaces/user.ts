import { User, UserAttributes, userDTO } from '../models'
import { hash } from 'bcrypt'
import { logger } from '../services'

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

export async function createAsync(body: UserAttributes): Promise<User | null> {
    try {
        const userInstance = await User.createAsync(body)

        return userInstance
    } catch (error) {
        logger.error(new Error(error))
        throw error
    }
}
