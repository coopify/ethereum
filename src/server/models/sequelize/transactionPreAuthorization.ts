import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from '.'

interface IAttributes {
    fromId: string
    toId: string
    offerId: string
    status: 'Waiting' | 'Confirmed' | 'Cancelled'
}

interface IUpdateAttributes {
    status: 'Confirmed' | 'Cancelled'
}

@Table({ timestamps: true })
class TransactionPreAuthorization extends Model<TransactionPreAuthorization> {

    public static async getAsync(id: string): Promise<TransactionPreAuthorization | null> {
        return this.findById<TransactionPreAuthorization>(id)
    }

    public static async getManyAsync(where: any): Promise<TransactionPreAuthorization[] | null> {
        return this.findAll<TransactionPreAuthorization>({ where, include:
            [
                { model: User, as: 'from' },
                { model: User, as: 'to' },
            ],
        })
    }

    public static async getOneAsync(where: any): Promise<TransactionPreAuthorization | null> {
        return this.findOne<TransactionPreAuthorization>({ where })
    }

    public static async createAsync(params: IAttributes): Promise<TransactionPreAuthorization> {
        const concept: TransactionPreAuthorization = await new TransactionPreAuthorization(params)
        return concept.save()
    }

    public static async updateAsync(instance: TransactionPreAuthorization, params: IUpdateAttributes): Promise<TransactionPreAuthorization> {
        instance.updateAttributes(params)
        return instance.save()
    }

    @PrimaryKey
    @Default(DataType.UUIDV1)
    @Column(DataType.UUID)
    public id

    @ForeignKey(() => User)
    @AllowNull(false) //Payments made by the system wont have a user
    @Column(DataType.UUID)
    public fromId

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    public toId

    @AllowNull(true)
    @Column(DataType.UUID)
    public offerId

    @AllowNull(false)
    @Column(DataType.STRING)
    public status

    @BelongsTo(() => User, 'toId')
    public to

    @BelongsTo(() => User, 'fromId')
    public from

}

function toDTO(authorization: TransactionPreAuthorization | null): object | null {
    if (!authorization) { throw new Error(`Failed to DTO Authorization: ${JSON.stringify(authorization)}`) }
    return {
        id: authorization.id,
        fromId: authorization.fromId,
        toId: authorization.toId,
        offerId: authorization.offerId,
        status: authorization.status,
    }
}

export { IAttributes, TransactionPreAuthorization, toDTO, IUpdateAttributes }
