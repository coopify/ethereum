import { IsBoolean, IsInt, IsNotEmpty, IsString, Validate } from 'class-validator'
import { CValidator, IValidationError } from '../lib/validations'
import * as config from '../config'
export class RedisConfigs extends CValidator {
    public isValid: boolean

    @IsNotEmpty({ message: `REDIS_PORT is empty` })
    @IsInt({ message: `REDIS_PORT is not a Number` })
    public port: number

    @IsNotEmpty({ message: `REDIS_HOST is empty` })
    @IsString({ message: `REDIS_HOST is not a String` })
    public host: string

    @IsNotEmpty({ message: `REDIS_PASSWORD is empty` })
    @IsString({ message: `REDIS_PASSWORD is not a String` })
    public password: string

    @IsNotEmpty({ message: `REDIS_USERNAME is empty` })
    @IsString({ message: `REDIS_USERNAME is not a String` })
    public username: string

    constructor() {
      super()
      this.isValid = false
      this.host = ''
      this.password = ''
      this.port = Number()
      this.username = ''
    }

    public validate(): IValidationError {
      this.setVariables()
      return super.validate()
    }

    private setVariables() {
      this.port = Number(process.env.REDIS_PORT)
      this.host = process.env.REDIS_HOST || ''
      this.password = process.env.REDIS_PASSWORD || ''
      this.username = process.env.REDIS_USERNAME || ''
    }
  }
