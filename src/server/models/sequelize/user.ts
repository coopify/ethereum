import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, Unique, AfterCreate } from 'sequelize-typescript'
import { rdb } from '../../services'

interface IAttributes {
    email: string
    password: string
    pictureURL: string
}

@Table({ timestamps: true })
class User extends Model<User> {
    @AfterCreate
    public static sendConfirmationEmail() {
        // TODO
    }

    public static async getAsync(id: string): Promise<User | null> {
        return this.findById<User>(id)
    }

    public static async getManyAsync(where: any): Promise<User[] | null> {
        return this.findAll<User>({ where })
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
    public password

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING)
    public email

    @Column(DataType.STRING)
    public pictureURL

    @Column(DataType.STRING)
    public resetToken

    @Default(false)
    @Column(DataType.BOOLEAN)
    public isVerified
}

function toDTO(user: User | null): object | null {
    if (!user) { throw new Error(`Failed to DTO User: ${JSON.stringify(user)}`) }
    return {
        id: user.id,
        email: user.email,
        pictureURL: user.pictureURL,
        resetToken: user.resetToken,
        isVerified: user.isVerified,
    }
}

export { IAttributes, User, toDTO }
