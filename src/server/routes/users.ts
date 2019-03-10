import { Router } from 'express'
import { usersController } from '../controllers'
import { authenticateRequest } from '../auth'

const userRoutes = Router()

userRoutes.get('/to', usersController.getToBalanceAsync) //TODO: Make this generic to have the account be recieved as part of the route
userRoutes.get('/from', usersController.getFromBalanceAsync) //TODO: Make this generic to have the account be recieved as part of the route

userRoutes.post('/pay', usersController.makePaymentAsync)
userRoutes.post('/signup', /*usersController.signupAsync,*/ usersController.signupAsync)
userRoutes.post('/login', usersController.loginAsync, usersController.generateTokenAsync)
userRoutes.post('/:userid/logout', usersController.logoutAsync)

userRoutes.param('userId', usersController.loadAsync)

export default userRoutes
