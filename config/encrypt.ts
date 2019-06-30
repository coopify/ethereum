import { IsNotEmpty, IsString } from 'class-validator'
import { CValidator, IValidationError } from '../lib/validations'

export class EncryptConfigs extends CValidator {
    public isValid: boolean

    @IsNotEmpty({ message: `ENCRYPT_PASSWORD is empty` })
    @IsString({ message: `ENCRYPT_PASSWORD is not a String` })
    public password: string

    constructor() {
      super()
      this.isValid = false
      this.password = ''
    }

    public validate(): IValidationError {
      this.setVariables()
      return super.validate()
    }

    private setVariables() {
      this.password = process.env.ENCRYPT_PASSWORD || ''
    }
}
