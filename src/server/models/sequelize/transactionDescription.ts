import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { User } from '.'

interface IAttributes {
    fromId?: string
    toId: string
    offerId: string
    proposalId: string
    transactionHash: string
    transactionConcept: string
    systemTransaction: boolean
}

@Table({ timestamps: true })
class TransactionDescription extends Model<TransactionDescription> {

    public static async getAsync(id: string): Promise<TransactionDescription | null> {
        return this.findById<TransactionDescription>(id)
    }

    public static async getManyAsync(where: any): Promise<TransactionDescription[] | null> {
        return this.findAll<TransactionDescription>({ where, include:
            [
                { model: User, as: 'from' },
                { model: User, as: 'to' },
            ],
        })
    }

    public static async getOneAsync(where: any): Promise<TransactionDescription | null> {
        return this.findOne<TransactionDescription>({ where })
    }

    public static async createAsync(params: IAttributes): Promise<TransactionDescription> {
        const concept: TransactionDescription = await new TransactionDescription(params)
        return concept.save()
    }

    @PrimaryKey
    @Default(DataType.UUIDV1)
    @Column(DataType.UUID)
    public id

    @ForeignKey(() => User)
    @AllowNull(true) //Payments made by the system wont have a user
    @Column(DataType.UUID)
    public fromId

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    public toId

    @AllowNull(true)
    @Column(DataType.UUID)
    public offerId

    @AllowNull(true)
    @Column(DataType.UUID)
    public proposalId

    @AllowNull(false)
    @Column(DataType.STRING)
    public transactionHash

    @AllowNull(false)
    @Column(DataType.STRING)
    public transactionConcept

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    public systemTransaction

    @BelongsTo(() => User, 'toId')
    public to

    @BelongsTo(() => User, 'fromId')
    public from

}

function toDTO(concept: TransactionDescription | null): object | null {
    if (!concept) { throw new Error(`Failed to DTO Concept: ${JSON.stringify(concept)}`) }
    return {
        id: concept.id,
        fromId: concept.fromId,
        proposalId: concept.proposalId,
        toId: concept.toId,
        offerId: concept.offerId,
        transactionConcept: concept.transactionConcept,
        systemTransaction: concept.systemTransaction,
    }
}

export { IAttributes, TransactionDescription, toDTO }
