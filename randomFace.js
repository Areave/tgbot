const axios = require('axios');
const fs = require('fs');

const url = 'https://thispersondoesnotexist.com/image';

const getRandomFace = async () => {
    return axios({
        url,
        method: 'GET',
        responseType: 'stream'
    }).then((stream)=>{
        const writer = fs.createWriteStream('event.jpg');
        return stream.data.pipe(writer);
    })
};

module.exports = getRandomFace;