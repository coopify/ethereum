import { Router } from 'express'
import { usersController } from '../controllers'

const userRoutes = Router()

userRoutes.get('/:userId/balance', usersController.getAccountBalance) //TODO: Make this generic to have the account be recieved as part of the route

userRoutes.post('/pay', usersController.makePaymentAsync)
userRoutes.post('/signup', usersController.signupAsync)

userRoutes.param('userId', usersController.loadAsync)

export default userRoutes
