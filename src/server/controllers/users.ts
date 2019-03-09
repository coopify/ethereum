import { compare, genSalt, hash } from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { UserInterface } from '../interfaces'
import { logger, redisCache } from '../services'
import { User, userDTO } from '../models'
import { ErrorPayload } from '../errorPayload'
import { isValidEmail } from '../../../lib/validations'

/**
 * This function loads the user that matchs with userId (request query) into response.locals.user
 */
export async function loadAsync(request: Request, response: Response, next: NextFunction, id: string) {
    try {
        const user =  await UserInterface.getAsync(id)

        if (!user) { return response.status(404).json(new Error('User not found')) }

        response.locals.user = user
        next()
    } catch (error) {
        logger.error(error)
        response.status(400).json(new Error(error))
    }
}

/**
 * This function loads the user that matchs with userId (request query) into response.locals.user
 */
export async function signupAsync(request: Request, response: Response, next: NextFunction) {
    try {
        if (!isValidEmail(request.body.email)) { return response.status(404).json(new ErrorPayload(400, 'Invalid email')) }
        const users = await UserInterface.findAsync({ email : request.body.email })

        if (users && users.length > 0) { return response.status(404).json(new ErrorPayload(404, 'Email already in use')) }

        const user =  await UserInterface.createAsync(request.body)

        if (!user) { return response.status(404).json(new ErrorPayload(404, 'Failed to create user')) }
        response.locals.user = user
        next()
    } catch (error) {
        logger.error(error)
        response.status(400).json(new ErrorPayload(400, error))
    }
}

export async function generateTokenAsync(request: Request, response: Response, next: NextFunction) {
    const user: User = response.locals.user
    const payload = { userId: user.id }

    try {
        const accessToken = sign(payload, 'someKeyToSubstitute')
        await redisCache.saveAccessTokenAsync(`${user.id}`, accessToken)
        const bodyResponse = { accessToken, user: userDTO(user) }
        response.status(200).json(bodyResponse)
    } catch (error) {
        logger.error('Error in generateTokenAsync')
        response.status(500).json(new ErrorPayload(500, error.message))
    }
  }

/**
 * This function loads the user that matchs with userId (request query) into response.locals.user
 */
export async function loginAsync(request: Request, response: Response, next: NextFunction) {

    try {
        if (!isValidEmail(request.body.email)) { return response.status(404).json(new ErrorPayload(400, 'Invalid email')) }
        const users =  await UserInterface.findAsync({ email : request.body.email })

        if (!users || users.length === 0) { return response.status(404).json(new Error('User not found')) }
        const user = users[0]
        if (user.password !== request.body.password) { return response.status(401).json(new Error('Wrong password')) }

        response.locals.user = user
        next()
    } catch (error) {
        logger.error(error)
        response.status(500).json(new ErrorPayload(500, error))
    }
}

export async function logoutAsync(request: Request, response: Response, next: NextFunction) {
    try {
        const logged = response.locals.loggedUser as User
        const user = response.locals.user as User
        if (logged && user && logged.id && user.id && logged.id.toString() === user.id.toString()) {
            const authHeader = request.header('authorization') || ''
            const token = authHeader.split(' ')[0]
            redisCache.deleteAccessTokenAsync(token)
            response.status(200)
            response.send()
        } else {
            response.status(401).json(new ErrorPayload(401, 'Unauthorized'))
        }
    } catch (error) {
        logger.error(error as Error)
        response.status(400).json(new ErrorPayload(40, error.message))
    }
}

/**
 * This function loads the user that matchs with bearer token (request header) into response.locals.loggedUser
 */
export async function loadLoggedUser(request: Request, response: Response, next: NextFunction) {
    const token = extractAuthBearerToken(request)
    try {
        if (!token) { return next() }

        const id: string = await redisCache.getUserIdAsync(token)

        if (!id) {
            logger.error(`USER Ctrl => Invalid bearer token: ${token}`)
            throw new Error(`Invalid bearer token: ${token}`)
        }

        const loggedUser = await UserInterface.getAsync(id)
        if (!loggedUser) {
            logger.error(`USER Ctrl => User not found with id: ${id}`)
            return response.status(403).json(new Error('User not found'))
        }

        logger.info(`USER Ctrl => Loaded logged user ${loggedUser.email}`)
        response.locals.loggedUser = loggedUser

        next()
    } catch (error) {
        logger.error(`USER Ctrl => Failed to load user with token: ${token}`)
        response.status(400).json(new Error(error))
    }
}

/**
 * This function should be used when the endpoint is extrictly for logged users
 */
export function authenticate(request: Request, response: Response, next: NextFunction) {
    if (!response.locals.loggedUser) { response.status(401).json(new Error(`Unauthorised. You need to provide a valid bearer token`)) }

    next()
}
function extractAuthBearerToken(request: Request): string {
    const authHeader = request.header('authorization') || ''
    const token = authHeader.split(' ')[1]
    return token
}
