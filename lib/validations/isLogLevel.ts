import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'

@ValidatorConstraint({ name: 'Valid Log Level', async: false })
export class IsLogLevel implements ValidatorConstraintInterface {
    private readonly logLevels: string[] = [
        'error',
        'warn',
        'info',
        'verbose',
        'debug',
        'silly',
      ]

    public validate(text: string, args: ValidationArguments) {
        return this.logLevels.indexOf(text) !== -1 // for async validations you must return a Promise<boolean> here
    }

    public defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
        return '($value) is is not a valid log level!'
    }

}
