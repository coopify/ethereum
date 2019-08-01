'use strict';
const config = require('../dist/config')
const services = require('../dist/src/server/services')

module.exports = {
    up: (queryInterface) => {
        config.validateAll()
        services.initExternalServices()
        return queryInterface.describeTable('User').then((table) => {
            const UserModel = queryInterface.sequelize.define('User', table, { tableName: 'User' })
            UserModel.findAll({}).then((users) => {
                users.map((user) => {
                    const oldData = user.pk
                    const newData = services.encryption.encryptString(oldData)
                    Object.assign(user, { ...user, pk: newData })
                    return user.save()
                })
            })
        })
    },

    down: (queryInterface) => {
        config.validateAll()
        services.initExternalServices()
        return queryInterface.describeTable('User').then((table) => {
            const UserModel = queryInterface.sequelize.define('User', table, { tableName: 'User' })
            UserModel.findAll({}).then((users) => {
                users.map((user) => {
                    const oldData = user.pk
                    const newData = services.encryption.encryptString(oldData)
                    Object.assign(user, { ...user, pk: newData })
                    return user.save()
                })
            })
        })
    }
};
