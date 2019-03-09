import { expect } from 'chai'
import { suite, test } from 'mocha-typescript'
import * as supertest from 'supertest'
import { usersController } from '../../../src/server/controllers'
import { UserAttributes } from '../../../src/server/models'
import { app } from '../../../src/server'

const request = supertest(app)
const createUser: UserAttributes = {
    email : 'sdfs@test.com',
    password: 'cdelsur',
    pictureURL : 'http://codigo.com',
}

describe('User Tests', async () => {
    describe('#POST /api/users/singup', async () => {
        it('Should create a new user and return a valid auth token', async () => {
            const res = await request.post('/api/users/signup').send(createUser).expect(200)
            expect(res.body.user.id).to.exist('error')
            expect(res.body.user.email).to.equal(createUser.email)
            expect(res.body.accessToken).to.exist('error')
        })
    })
})
