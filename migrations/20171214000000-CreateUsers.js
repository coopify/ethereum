'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.createTable('User', {
                id : {
                    type: Sequelize.UUID,
                    primaryKey : true
                },
                userId : {
                    type: Sequelize.STRING,
                    allowNull : false
                },
                address : {
                    type: Sequelize.STRING,
                    allowNull : false
                },
                pk : {
                    type: Sequelize.STRING,
                    allowNull : false
                },
                createdAt : {
                    type: Sequelize.DATE,
                    allowNull : false
                },
                updatedAt : {
                    type: Sequelize.DATE,
                    allowNull : false
                }
            })
        ]
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('User')
    }
}
