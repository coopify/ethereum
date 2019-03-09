import { Router } from 'express'
import { usersController } from '../controllers'
import { authenticateRequest } from '../auth'

const userRoutes = Router()

userRoutes.post('/signup', usersController.signupAsync, usersController.generateTokenAsync)
userRoutes.post('/login', usersController.loginAsync, usersController.generateTokenAsync)
userRoutes.post('/:userid/logout', usersController.logoutAsync)

userRoutes.param('userId', usersController.loadAsync)

export default userRoutes
