import * as dotenv from 'dotenv'
dotenv.config()
import app from './server'
import { logger, initWLogger, initExternalServices } from './server/services'
import * as config from '../config'

const errors = config.validateAll()
initWLogger()

if (errors.length > 0) {
  errors.forEach((error) => logger.error(`${error.target}: [${error.failedConstraints}]`))
} else {
  initExternalServices()
  app(config.server.port)
}
