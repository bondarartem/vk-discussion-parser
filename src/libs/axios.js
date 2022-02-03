http = require("axios");


const axios = http.create({
    baseURL: 'https://api.vk.com/method/'
});

axios.defaults.params = {
    access_token: process.env.VK_TOKEN,
    v: '5.131'
};

exports.axios = axios;