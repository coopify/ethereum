import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, Unique } from 'sequelize-typescript'

interface IAttributes {
    userId: string
    address: string
    pk: string
}

@Table({ timestamps: true })
class User extends Model<User> {

    public static async getAsync(id: string): Promise<User | null> {
        return this.findById<User>(id)
    }

    public static async getManyAsync(where: any): Promise<User[] | null> {
        return this.findAll<User>({ where })
    }

    public static async getOneAsync(where: any): Promise<User | null> {
        return this.findOne<User>({ where })
    }

    public static async createAsync(params: IAttributes): Promise<User> {
        const user: User = await new User(params)
        return user.save()
    }

    @PrimaryKey
    @Default(DataType.UUIDV1)
    @Column(DataType.UUID)
    public id

    @AllowNull(false)
    @Column(DataType.STRING)
    public userId

    @AllowNull(false)
    @Column(DataType.STRING)
    public address

    @AllowNull(false)
    @Column(DataType.STRING)
    public pk

}

function toDTO(user: User | null): object | null {
    if (!user) { throw new Error(`Failed to DTO User: ${JSON.stringify(user)}`) }
    return {
        id: user.id,
        userId: user.userId,
        address: user.address,
    }
}

export { IAttributes, User, toDTO }
