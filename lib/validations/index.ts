import { IsLogLevel } from './isLogLevel'
import { IsValidEnv } from './isValidEnv'
import { Validator } from 'class-validator'

interface IValidationError {
    target: string
    failedConstraints: string[]
    hasErrors: boolean
  }

interface IValidations {
    isValid: boolean
    validate(): IValidationError
}

class CValidator implements IValidations {
    public isValid: boolean

    constructor() {
        this.isValid = false
    }

    public validate(): IValidationError {
        const validator = new Validator()
        const errors = validator.validateSync(this)
        const validationError = {
            failedConstraints: errors.map((c) => toErrorMessage(c.constraints)),
            hasErrors: errors.length > 0,
            target: this.constructor.name,
        }
        this.isValid = !validationError.hasErrors
        return validationError
    }
}

function toErrorMessage(constraint: { [type: string]: string }): string {
    return constraint[Object.keys(constraint)[0]]
 }

function isValidEmail( email: string ) {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return mailformat.test(email)
}

export { IsLogLevel, IValidations, IValidationError, CValidator, IsValidEnv, isValidEmail }
