const db = require('./models');

const app = require('./libs/app');
const sync = () => {
    db.sequelize.sync()
        .then(() => app.run())
        .catch(async (e) => {
            console.log('Error: ' + e);

            // wait 1 second before new connection
            await new Promise(resolve => setTimeout(resolve, 3000));

            sync();
        });
};

sync();

app.listenTopics();