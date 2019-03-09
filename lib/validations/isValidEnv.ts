import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator'

@ValidatorConstraint({ name: 'Valid Env', async: false })

  export class IsValidEnv implements ValidatorConstraintInterface {
    private readonly environments: string[] = [
      'development',
      'stage',
      'production',
      'test',
    ]

    public validate(text: string, args: ValidationArguments) {
      return this.environments.indexOf(text) !== -1
    }

    public defaultMessage(args: ValidationArguments) {
      // here you can provide default error message if validation failed
      return 'Unrecognized environment: ($value)'
    }
  }
