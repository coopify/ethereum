import { IsNotEmpty, IsString, Validate } from 'class-validator'
import { CValidator, IValidationError } from '../lib/validations'

export class PusherConfigs extends CValidator {
    public isValid: boolean

    @IsNotEmpty({ message: `PUSHER_APIKEY is empty` })
    @IsString({ message: `PUSHER_APIKEY is not a String` })
    public apikey: string

    @IsNotEmpty({ message: `PUSHER_APPID is empty` })
    @IsString({ message: `PUSHER_APPID is not a String` })
    public appId: string

    @IsNotEmpty({ message: `PUSHER_SECRET is empty` })
    @IsString({ message: `PUSHER_SECRET is not a String` })
    public secret: string

    @IsNotEmpty({ message: `PUSHER_CLUSTER is empty` })
    @IsString({ message: `PUSHER_CLUSTER is not a String` })
    public cluster: string

    public validate(): IValidationError {
      this.setVariables()
      return super.validate()
    }

    //tslint:disable:member-ordering
    constructor() {
      super()
      this.apikey = '',
      this.appId = '',
      this.secret = '',
      this.cluster = '',
      this.isValid = false
    }

    private setVariables() {
      this.apikey = process.env.PUSHER_APIKEY || ''
      this.appId = process.env.PUSHER_APPID || ''
      this.secret = process.env.PUSHER_SECRET || ''
      this.cluster = process.env.PUSHER_CLUSTER || ''
    }
  }
