const TelegramBot = require('node-telegram-bot-api');
const vk = require('./libs/vk');
const db = require('./models');
const initData = require('./config/data');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});
const topics = require("./controllers/topic.controller");

db.sequelize.sync();

const frequencyPolling = 0.5; // in minutes


const checkNewComments = async () => {
    const topicInfoMap = initData.topics;

    for (const topicInfo of topicInfoMap) {
        const t = await topics.findOne(topicInfo.topic_id);

        let params = {};

        if (t !== null && t.getDataValue('last_comment_id')) {
            params = {
                group_id: topicInfo.group_id,
                topic_id: topicInfo.topic_id,
                start_comment_id: t.getDataValue('last_comment_id'),
                offset: 1,
                sort: 'asc'
            }
        } else {
            params = {
                group_id: topicInfo.group_id,
                topic_id: topicInfo.topic_id,
                sort: 'desc',
                count: 1
            }
        }
        vk.getBoardComments(params).then(data => {
            let result = [];
            if (data.response.items) {
                data.response.items.forEach((comment) => {
                    result.push({
                        id: comment.id,
                        comment: comment.text
                            + '\n\nhttps://vk.com/topic-' + params.group_id + '_' + params.topic_id,
                        photos: comment.attachments ? comment.attachments
                            .filter(p => p.type === 'photo')
                            .map((p) => {
                                return {
                                    type: 'photo',
                                    media: p.photo.sizes[p.photo.sizes.length - 1].url,
                                };
                            }) : []
                    })
                })
            }
            const sendMessages = async (result) => {
                for (const comment of result) {
                    if (comment.photos) {
                        await bot.sendMessage('@rooms_lispb', comment.comment);
                        await bot.sendMediaGroup('@rooms_lispb', comment.photos);
                        await topics.updateOrCreate({
                            id: topicInfo.topic_id,
                            group_id: topicInfo.group_id,
                            last_comment_id: comment.id
                        });
                    } else if (comment.comment) {
                        await bot.sendMessage('@rooms_lispb', comment.comment);

                        await topics.updateOrCreate({
                            id: topicInfo.topic_id,
                            group_id: topicInfo.group_id,
                            last_comment_id: comment.id
                        });
                    }
                }
            };

            sendMessages(result)
        });
    }
};

const shortPolling = () => {
    setInterval(async () => {
        await checkNewComments();
    }, frequencyPolling * 60 * 1000); //
};

shortPolling();

