const topics = require("../controllers/topic.controller");
const helpers = require("./helpers");

exports.addTopic = (msg, match) => {
    const name = match[1];

    const group_id = match[2];
    const topic_id = match[3];

    topics.updateOrCreate({
        id: topic_id,
        group_id: group_id,
        name: name
    }).then(async () => {
        await bot.sendMessage(
            msg.chat.id,
            'Добавлено обсуждение – ' + helpers.getTgLink(name, helpers.getTopicLink(group_id, topic_id)),
            {parse_mode: 'HTML'}
        )
    }).catch(async (e) => {
        console.log(e);
        await bot.sendMessage(
            msg.chat.id,
            'Не удалось добавить обсуждение ' +
            helpers.getTgLink(name, helpers.getTopicLink(group_id, id))
            + '\nПопробуй отправить команду в формате ' +
            '\n/add_topic "Название обсуждения" id_группы id_обсуждения',
            {parse_mode: 'HTML'}
        )
    });
};

exports.deleteTopic = (msg, match) => {
    const topic_id = match[1];

    const t = topics.findOne(topic_id);
    console.log(t);
    if (t !== null) {
        topics.delete({
            id: topic_id
        }).then(async () => {
            await bot.sendMessage(
                msg.chat.id,
                'Удалено обсуждение – ' + helpers.getTgLink(t.name, helpers.getTopicLink(t.group_id, t.id))
            )
        }).catch(async () => {
            await bot.sendMessage(
                msg.chat.id,
                'Не удалось добавить обсуждение – ' + helpers.getTgLink(t.name, helpers.getTopicLink(t.group_id, t.id))
            )
        });
    } else {
        bot.sendMessage(
            msg.chat.id,
            'Обсуждение не найдено. Пример запроса "/delete_topic 123", где 123 – id обсуждения'
        )
    }
};

exports.getTopicList = (msg) => {
    topics.findAll().then(async (data) => {
        const message = data.length ? data.reduce((r, cur) => (
            helpers.getTgLink(cur.name, helpers.getTopicLink(cur.group_id, cur.id))
            + '\t'+ cur.id
            + '\n' + r
        ), '') : 'В базе нет ни одного обсуждения';
        await bot.sendMessage(msg.chat.id, message, {parse_mode: 'HTML'})
    }).catch(async (e) => {
        console.log(e);
        await bot.sendMessage(
            msg.chat.id,
            'Не удалось вывести список обсуждений'
        )
    });
};