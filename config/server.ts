import { IsInt, IsString, IsNotEmpty, Validate } from 'class-validator'
import { CValidator, IValidationError, IsValidEnv } from '../lib/validations'

export class ServerConfigs extends CValidator {
    public  isValid: boolean

    @IsNotEmpty({ message: `PORT is empty` })
    @IsInt({ message: `PORT is not a Number` })
    public port: number

    @Validate(IsValidEnv, { message: `NODE_ENV is not a valid environment` })
    @IsString({ message: `NODE_ENV is not a String` })
    public environment: string

    @IsString({ message: `BASE_PATH is not a String` })
    @IsNotEmpty({ message: `BASE_PATH is empty` })
    public basePath: string

    constructor() {
      super()
      this.isValid = false
      this.port = Number()
      this.environment = ''
      this.basePath = ''
    }

    public validate(): IValidationError {
        this.setVariables()
        return super.validate()
    }

    private setVariables() {
        this.port = Number(process.env.PORT)
        this.environment = process.env.NODE_ENV || ''
        this.basePath = process.env.BASE_PATH || ''
    }
}
