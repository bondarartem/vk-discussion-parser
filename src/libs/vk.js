// https://api.vk.com/method/friends.get?user_id=1&v=5.74&access_token=9de3d28e9de3d28e9de3d28e939d98cd4999de39de3d28efc191359d67a70bac179ee20


const {axios} = require("./axios");

async function vkRequest(method, params) {
    const response = await axios.get(method, {params});
    return response.data;
}

async function getBoardComments(params) {
    return vkRequest('board.getComments', params);
}


exports.getBoardComments = getBoardComments;