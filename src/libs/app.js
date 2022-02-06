const initData = require('../config/data');
const helpers = require('./helpers');

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
                        const text = helpers.getTgLink(topicInfo.name, helpers.getTopicLink(params.group_id, params.topic_id)) + '\n\n' + comment.text;
                        result.push({
                            id: comment.id,
                            comment: text,
                            photos: comment.attachments ? comment.attachments
                                .filter(p => p.type === 'photo')
                                .map((p, i) => {
                                    return {
                                        type: 'photo',
                                        caption: i === 0 ? text : '',
                                        media: p.photo.sizes[p.photo.sizes.length - 1].url,
                                    };
                                }).slice(0, 10) : []
                        })
                    })
                }
                for (const comment of result) {
                    if (comment.photos && comment.photos.length > 0) {
                        try {
                            await bot.sendMediaGroup('@rooms_lispb', comment.photos, {parse_mode: 'HTML'});

                        } catch (e) {
                            console.log(e);
                            console.log(comment.photos);
                        }
                        await topics.updateOrCreate({
                            id: topicInfo.id,
                            group_id: topicInfo.group_id,
                            last_comment_id: comment.id
                        });
                    }
                    else if (comment.comment) {
                        try {
                            await bot.sendMessage('@rooms_lispb', comment.comment, {parse_mode: 'HTML'});
                        } catch (e) {
                            console.log(e);
                            console.log(comment.comment);
                        }
                        await topics.updateOrCreate({
                            id: topicInfo.id,
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
    const commands = require("./commands");

    bot.onText(/\/add_topic "(.+)" (\d+) (\d+)/, commands.addTopic);
    bot.onText(/\/delete_topic (\d+)/, commands.deleteTopic);
    bot.onText(/\/list_topic/, commands.getTopicList);
    bot.onText(/\/check/, async (msg) => {
        await checkNewComments();
    })
};

