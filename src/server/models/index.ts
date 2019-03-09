import { mongodb } from '../services'
import { User, userDTO, UserAttributes } from './sequelize'

export const seqModels = [ User ]

export { User, userDTO, UserAttributes }
