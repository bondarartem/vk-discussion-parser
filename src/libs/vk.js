const {axios} = require("./axios");

async function vkRequest(method, params) {
    const response = await axios.get(method, {params});
    return response.data;
}

async function getBoardComments(params) {
    return vkRequest('board.getComments', params);
}


exports.getBoardComments = getBoardComments;