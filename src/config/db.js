module.exports = {
    HOST: process.env.DB_HOST,
    USER: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PASSWORD,
    DB: process.env.MYSQL_DATABASE,
    port: process.env.DB_PORT,

    dialect: "mysql",
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};