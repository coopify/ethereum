import { IsInt, IsString, IsNotEmpty, Validate, ValidateIf, IsFQDN } from 'class-validator'
import { CValidator, IValidationError } from '../lib/validations'
import * as dbConfigs from './database'

export class RDBConfigs extends CValidator {
    public isValid: boolean

    @IsNotEmpty({ message: `DB_HOST is empty` })
    @IsString({ message: `DB_HOST is not a String` })
    public host: string

    @IsNotEmpty({ message: `DB_NAME is empty` })
    @IsString({ message: `DB_NAME is not a String` })
    public name: string

    @IsNotEmpty({ message: `DB_PASSWORD is empty` })
    @IsString({ message: `DB_PASSWORD is not a String` })
    public password: string

    @IsNotEmpty({ message: `DB_PORT is empty` })
    @IsInt({ message: `DB_PORT is not a Number` })
    public port: number

    @ValidateIf((x) => x.url !== '' && x.url != null, { message: `DB_URL is empty` })
    @IsFQDN({}, { message: `DB_URL is not a valid domain URL` })
    public url: string

    @IsNotEmpty({ message: `DB_USER is empty` })
    @IsString({ message: `DB_USER is not a String` })
    public user: string

    constructor() {
      super()
      this.isValid = false
      this.host = ''
      this.name = ''
      this.password = ''
      this.port = Number()
      this.url = ''
      this.user = ''
    }

    public validate(): IValidationError {
        this.setVariables()
        return super.validate()
    }

    public getConnectionString(): string {
      // See https://www.postgresql.org/docs/current/static/libpq-connect.html#LIBPQ-CONNSTRING
      return `postgresql://${this.user}:${this.password}@${this.host}:${this.port}/${this.name}`
    }

    private setVariables() {
      const dbConfig = dbConfigs[process.env.NODE_ENV || 'development']
      this.host = dbConfig.host || ''
      this.name = dbConfig.database || ''
      this.password = dbConfig.password || ''
      this.port = Number(dbConfig.port)
      this.user = dbConfig.username || ''
      this.url = process.env.DB_URL || ''
    }
  }
