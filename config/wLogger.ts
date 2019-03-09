import { IsBoolean, IsString, Validate } from 'class-validator'
import { IsLogLevel, CValidator, IValidationError } from '../lib/validations'

export class LoggerConfigs extends CValidator {
    public isValid: boolean

    @IsBoolean({ message: `ENABLED is not a Boolean` })
    public enabled: boolean = true

    @Validate(IsLogLevel, { message: `LOG_LEVEL is not a valid level` })
    @IsString({ message: `LOG_LEVEL is not a String` })
    public level: string

    constructor() {
      super()
      this.isValid = false
      this.level = ''
    }

    public validate(): IValidationError {
        this.setVariables()
        return super.validate()
    }

    private setVariables() {
        this.level = process.env.LOG_LEVEL || ''
        this.enabled = Boolean(process.env.ENABLED)
    }
}
