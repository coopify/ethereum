'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn('TransactionDescription', 'offerId', {
            type: Sequelize.UUID,
            allowNull: true,
        })
    },

    down: (queryInterface) => {
        return queryInterface.changeColumn('TransactionDescription', 'offerId', {
            type: Sequelize.UUID,
            allowNull: false,
        })
    }
}
