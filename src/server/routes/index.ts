import { Router } from 'express'
import userRoutes from './users'
import { loadLoggedUser } from '../controllers/users'

const router = Router()

router.use('*', loadLoggedUser)

router.use('/users', userRoutes)

export { router }
