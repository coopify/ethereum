import { IsNotEmpty, IsString } from 'class-validator'
import { CValidator, IValidationError } from '../lib/validations'

export class Web3Configs extends CValidator {
    public isValid: boolean

    @IsNotEmpty({ message: `WEB3_CONTRACT_ADDRESS is empty` })
    @IsString({ message: `WEB3_CONTRACT_ADDRESS is not a String` })
    public contractAddress: string

    @IsNotEmpty({ message: `WEB3_FROM_ADDRESS is empty` })
    @IsString({ message: `WEB3_FROM_ADDRESS is not a String` })
    public fromAddress: string

    @IsNotEmpty({ message: `WEB3_FROM_PK is empty` })
    @IsString({ message: `WEB3_FROM_PK is not a String` })
    public fromPK: string

    @IsNotEmpty({ message: `WEB3_TO_ADDRESS is empty` })
    @IsString({ message: `WEB3_TO_ADDRESS is not a String` })
    public toAddress: string

    @IsNotEmpty({ message: `WEB3_PROVIDER is empty` })
    @IsString({ message: `WEB3_PROVIDER is not a String` })
    public provider: string

    constructor() {
        super()
        this.isValid = false
        this.fromAddress = ''
        this.fromPK = ''
        this.contractAddress = ''
        this.toAddress = ''
        this.provider = ''
    }

    public validate(): IValidationError {
        this.setVariables()
        return super.validate()
    }

    private setVariables() {
        this.contractAddress = process.env.WEB3_CONTRACT_ADDRESS || ''
        this.fromAddress = process.env.WEB3_FROM_ADDRESS || ''
        this.fromPK = process.env.WEB3_FROM_PK || ''
        this.toAddress = process.env.WEB3_TO_ADDRESS || ''
        this.provider = process.env.WEB3_PROVIDER || ''
    }
  }
