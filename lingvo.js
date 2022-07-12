const config = require('config');
const axios = require('axios');
const getRandomWord = require('./vocabulary');

const authToken = config.get('apiLingvoToken');
const apiUrl = 'https://developers.lingvolive.com/api/v1'
let accessToken = '';
let isAccessTokenEnable = false;


const setAccessToken = () => {

    if (!accessToken || !isAccessTokenEnable) {
        return axios.post(apiUrl + '.1/authenticate', {}, {
            headers: {
                'Authorization': `Basic ${authToken}`
            }
        }).then(res => {
            accessToken = res.data;
            isAccessTokenEnable = true;
            // console.log('access token setted', accessToken);
            return accessToken;
        }).catch(e => {
            console.log('ERROR_____________', e.message)
        })
    } else {
        return Promise.resolve(accessToken);
    }

};

const getTranslate = (word, accessToken) => {
    return axios.get(apiUrl + '/Minicard', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            text: word,
            srcLang: 1033,
            dstLang: 1049
        }
    }).then(res => {
        return res.data['Translation']['Translation'];
    });
};


const getPairOfWords = () => {
    return setAccessToken().then(accessToken => {
        // console.log(accessToken);
        const randomWord = getRandomWord();
        // const randomWord = 'rrr';
        return axios.get(apiUrl + '/Minicard', {
            headers: {
                // 'Authorization': `Bearer ${accessToken}` + '4'
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                text: randomWord,
                srcLang: 1033,
                dstLang: 1049
            }
        }).then(res => {
            return [randomWord, res.data['Translation']['Translation']];
        })
            .catch(e => {
                const errorStatus = e.message.split(' ').pop();
                if (errorStatus === '401') {
                    isAccessTokenEnable = false;
                    setAccessToken();
                    return ['ERROR', 'Истек срок действия временного токена(('];
                } else if (errorStatus === '404') {
                    return ['ERROR', 'Не удалось перевести слово ' + randomWord];
                } else {
                    return ['ERROR', 'Что-то непонятное произошло']
                }
            })
    })
};

// if (!!accessToken.length) {
//     console.log('no access token');
//     setAccessToken();
// }

// const getWords = async () => {
//     console.log('getWords');
//     return await getPairOfWords()
// };

// getPairOfWords().then(data => console.log(data));


module.exports = getPairOfWords;


