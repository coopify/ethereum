'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return  queryInterface.removeConstraint('TransactionDescription', 'TransactionDescription_fromId_fkey').then(() => {
            return queryInterface.changeColumn('TransactionDescription', 'fromId', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'User',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            })
        })
    },

    down: (queryInterface) => {
        return queryInterface.changeColumn('TransactionDescription', 'fromId', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
    }
}
