'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
        return [
            queryInterface.createTable('User', {
                id : {
                    type: Sequelize.UUID,
                    primaryKey : true
                },
                password : {
                    type: Sequelize.STRING,
                    allowNull : false
                },
                email : {
                    type: Sequelize.STRING,
                    allowNull : false
                },
                pictureURL : Sequelize.STRING,
                resetToken : Sequelize.STRING,
                isVerified : {
                    type: Sequelize.BOOLEAN,
                    default: false
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
        return queryInterface.dropTable('User')
    }
}
