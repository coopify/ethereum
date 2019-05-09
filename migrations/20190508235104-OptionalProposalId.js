'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('TransactionDescription', 'proposalId', {
            type: Sequelize.UUID,
            allowNull: true,
        })
    },

    down: (queryInterface) => {
        return queryInterface.changeColumn('TransactionDescription', 'proposalId', {
            type: Sequelize.UUID,
            allowNull: false,
        })
    }
}
