// exports.getTopicLink = (group_id, topic_id) => {
//     return 'https://vk.com/topic-' + group_id + '_' + topic_id;
// };
//
// exports.getTgLink = (name, link) => {
//     return '[' + name + '](' + link + ')';
// };

exports.getTopicLink = (group_id, topic_id) => {
    return 'https://vk.com/topic-' + group_id + '_' + topic_id;
};

exports.getTgLink = (name, link) => {
    return "<a href='"+link+"'>" + name + "</a>";
};