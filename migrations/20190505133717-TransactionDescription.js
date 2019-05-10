'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('TransactionDescription', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true
            },
            fromId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            toId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            offerId: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            proposalId: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            transactionHash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            transactionConcept: {
                type: Sequelize.STRING,
                allowNull: false
            },
            systemTransaction: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        })
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('TransactionDescription')
    }
}
