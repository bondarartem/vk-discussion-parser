const initData = require('../config/data');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

exports.run = () => {
    setInterval(async () => {
        await checkNewComments();
    }, initData.frequencyPolling * 60 * 1000); //
};

const checkNewComments = async () => {
    try {
        const vk = require('../libs/vk');

        const topics = require("../controllers/topic.controller");
        const data = await topics.findAll();
        for (const topicInfo of data) {
            let params = {};

            if (topicInfo.last_comment_id) {
                params = {
                    group_id: topicInfo.group_id,
                    topic_id: topicInfo.id,
                    start_comment_id: topicInfo.last_comment_id,
                    offset: 1,
                    sort: 'asc'
                }
            } else {
                params = {
                    group_id: topicInfo.group_id,
                    topic_id: topicInfo.id,
                    sort: 'desc',
                    count: 1
                }
            }
            vk.getBoardComments(params).then((async (data) => {
                let result = [];
                if (data && data.response && data.response.items) {
                    data.response.items.forEach((comment) => {
                        result.push({
                            id: comment.id,
                            comment: getTgLink(topicInfo.name, getTopicLink(params.group_id, params.topic_id)) + '\n\n' + comment.text,
                            photos: comment.attachments ? comment.attachments
                                .filter(p => p.type === 'photo')
                                .map((p, i) => {
                                    return {
                                        type: 'photo',
                                        caption: i === 0 ? comment.text : '',
                                        media: p.photo.sizes[p.photo.sizes.length - 1].url,
                                    };
                                }).slice(0, 10) : []
                        })
                    })
                }

                for (const comment of result) {
                    if (comment.photos && comment.photos.length > 0) {
                        await bot.sendMediaGroup('@rooms_lispb', comment.photos, {parse_mode: 'MarkdownV2'});

                        await topics.updateOrCreate({
                            id: topicInfo.topic_id,
                            group_id: topicInfo.group_id,
                            last_comment_id: comment.id
                        });
                    }
                    else if (comment.comment) {
                        await bot.sendMessage('@rooms_lispb', comment.comment);

                        await topics.updateOrCreate({
                            id: topicInfo.topic_id,
                            group_id: topicInfo.group_id,
                            last_comment_id: comment.id
                        });
                    }
                }
            }));
        }
    } catch (err) {
        console.log(err)
    }
};

exports.listenTopics = () => {
    const topics = require("../controllers/topic.controller");

    bot.onText(/\/add_topic "(.+)" (\d+) (\d+)/, (msg, match) => {
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
                'Добавлено обсуждение – ' + getTgLink(name, getTopicLink(group_id, topic_id)),
                {parse_mode: 'MarkdownV2'}
            )
        }).catch(async (e) => {
            console.log(e);
            await bot.sendMessage(
                msg.chat.id,
                'Не удалось добавить обсуждение ' +
                getTgLink(name, getTopicLink(group_id, id))
                + '\nПопробуй отправить команду в формате ' +
                '\n/add_topic "Название обсуждения" id_группы id_обсуждения',
                {parse_mode: 'MarkdownV2'}
            )
        });
    });

    bot.onText(/\/delete_topic (\d+)/, (msg, match) => {
        const topic_id = match[1];

        const t = topics.findOne(topic_id);
        console.log(t);
        if (t !== null) {
            topics.delete({
                id: topic_id
            }).then(async () => {
                await bot.sendMessage(
                    msg.chat.id,
                    'Удалено обсуждение – ' + getTgLink(t.name, getTopicLink(t.group_id, t.id))
                )
            }).catch(async () => {
                await bot.sendMessage(
                    msg.chat.id,
                    'Не удалось добавить обсуждение – ' + getTgLink(t.name, getTopicLink(t.group_id, t.id))
                )
            });
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Обсуждение не найдено. Пример запроса "/delete_topic 123", где 123 – id обсуждения'
            )
        }
    });

    bot.onText(/\/list_topic/, (msg) => {
        topics.findAll().then(async (data) => {
            const message = data.length ? data.reduce((r, cur) => (
                getTgLink(cur.name, getTopicLink(cur.group_id, cur.id))
                + '\t'+ cur.id
                + '\n' + r
            ), '') : 'В базе нет ни одного обсуждения';
            await bot.sendMessage(msg.chat.id, message, {parse_mode: 'MarkdownV2'})
        }).catch(async (e) => {
            await bot.sendMessage(
                msg.chat.id,
                'Не удалось вывести список обсуждений'
            )
        });
    });
};

const  getTopicLink = (group_id, topic_id) => {
    return 'https://vk.com/topic-' + group_id + '_' + topic_id;
};

const getTgLink = (name, link) => {
    return '[' + name + '](' + link + ')';
};