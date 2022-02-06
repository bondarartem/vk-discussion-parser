module.exports = (sequelize, Sequelize) => {
    const Topic = sequelize.define("topics", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        group_id: {
            type: Sequelize.BIGINT
        },
        last_comment_id: {
            type: Sequelize.BIGINT
        },
        name: {
            type: Sequelize.STRING
        }
    });

    return Topic;
};