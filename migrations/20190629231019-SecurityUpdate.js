'use strict';
const config = require('../dist/config')
const services = require('../dist/src/server/services')

module.exports = {
    up: async (queryInterface) => {
        await config.validateAll()
        await services.initWLogger()
        await services.initExternalServices()
        const UserModel = queryInterface.sequelize.define('User', await queryInterface.describeTable('User'), { tableName: 'User' })
        const existingUsers = await UserModel.findAll({})
        return Promise.all(
            existingUsers.map(async user => {
                const oldData = user.pk
                const newData = services.encryption.encryptString(oldData)
                Object.assign(user, { ...user, pk: newData })
                return user.save()
            })
        )
    },

    down: (queryInterface) => {
        await config.validateAll()
        await services.initWLogger()
        await services.initExternalServices()
        const UserModel = queryInterface.sequelize.define('User', await queryInterface.describeTable('User'), { tableName: 'User' })
        const existingUsers = await UserModel.findAll({})
        return Promise.all(
            existingUsers.map(async user => {
                const oldData = user.pk
                const newData = services.encryption.decryptString(oldData)
                Object.assign(user, { ...user, pk: newData })
                return user.save()
            })
        )
    }
};
