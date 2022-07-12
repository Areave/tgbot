const config = require('config');
const fs = require('fs');
const BotApi = require('node-telegram-bot-api');
const {gameOptions, againOptions, predictionOptions, randomFaceOptions} = require('./options');
const commands = require('./commands');
const getPairOfWords = require('./lingvo');
const getRandomFace = require('./randomFace');
const apiToken = config.get('apiToken');
const helloProbability = config.get('helloProbability');
const pidorProbability = config.get('pidorProbability');
const beardAnswerProbability = config.get('beardAnswerProbability');
const randomInsultProbability = config.get('randomInsultProbability');
const mamaProbability = config.get('mamaProbability');
const faggotAnswerProbability = config.get('faggotAnswerProbability');
const guessingTimer = config.get('guessingTimer');
const badWords = config.get('bad_words');
const insults = config.get('insults');
const bot = new BotApi(apiToken, {polling: true});
const process = require('node:process');
require('dotenv').config();
// process.env["NTBA_FIX_350"] = 1;

const answers = {};
const guessings = {};

const startGuessing = (userId, chatId, name) => {

    if (isGuessingAvailable(name, guessings)) {
        const prediction = getRandomElement('predictions');
        guessings[name] = {
            lastGuessTimestamp: Date.now(),
            prediction
        };
        const treeting = getRandomElement('treetings');
        return bot.sendMessage(chatId, name + `, ${treeting}, сегодня у тебя будет ${prediction}!`);
    }
    if (guessings[name]) {
        return bot.sendMessage(chatId, `Ты уже гадал(а), ` + name + `, тебе выпал ${guessings[name].prediction}. Следующая попытка через `
            + getRemainTimeToGuessing(name, guessings));
    }



};

const stopGame = async (userId, chatId) => {
    if (!answers[userId]) {
        await bot.sendMessage(chatId, `You have no active games`);
        return;
    }
    delete answers[userId];
    await bot.sendMessage(chatId, `Your game was ended`);
};

const startGame = async (userId, chatId) => {
    if (answers[userId]) {
        bot.sendMessage(chatId, 'Вы уже играете в игру');
        return bot.sendMessage(chatId, 'Guess the number from 0 to 9!', gameOptions);
    }
    const randomNumber = Math.floor(Math.random()*10);
    answers[userId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess the number from 0 to 9!', gameOptions);
};

const sendRandomFace = (chatId) => {
    getRandomFace().then((writer)=>{
        writer.on('finish', ()=> {
            bot.sendPhoto(chatId, 'event.jpg', randomFaceOptions);
        });
    })
};


const start = () => {

    bot.setMyCommands(commands);

    bot.on('callback_query', reply => {
        const chatId = reply.message.chat.id;
        const data = reply.data;
        const userId = reply.from.id;
        const userName = reply.from.first_name;
        // console.log(reply);
        // const messageId = reply.message.message_id;

        switch (data) {
            case 'again':
                startGame(userId, chatId);
                return;
            case 'anotherFace':
                sendRandomFace(chatId);
                return;
            case 'guess':
                startGuessing(userId, chatId, userName);
                return;
            case 'stopgame':
                stopGame(userId, chatId);
                return;
        }

        if (!answers[userId]) {
            return bot.sendMessage(chatId, `You have no active games`);
        }

        if (answers[reply.from.id] == reply.data) {
            delete answers[userId];
            return bot.sendMessage(chatId, `Угадал! это ${data}! поздравления!`, againOptions);
        } else {
            return bot.sendMessage(chatId, `Извини, ${getRandomElement('treetings')}, это не ${data}`);
        }
    });

    bot.on('message', async message => {
        const userName = message.from.username;
        const text = message.text;
        const chatId = message.chat.id;
        const userId = message.from.id;
        const messageId = message.message_id;
        let foreword = '';

        switch (userName) {
            case 'sensationm':
                foreword = 'Когда коммунизм построишь, Мокес?';
                break;
            case 'rockpapers':
                foreword = 'Привет, Римма! Рад тебя видеть';
                break;
            case 'Alestormtrooper':
                foreword = 'Эй красавчик, покатай меня на своем мотоцикле';
                break;
            case 'seaberry':
                foreword = 'Привет крошка, будешь текилу?';
                break;
            case 'mini_doktor':
                foreword = 'Привет, Аня, где ты вечно пропадаешь?';
                break;
            case 'tell_me_anything':
                foreword = 'Ничего себе кто к нам пожалоовал!';
                break;
            case 'Ham9ik':
                foreword = 'Как дела, создатель?';
                break;
            case 'lada_qa':
                foreword = 'Привет, зая';
                break;
            case 'shineuntiltomorwer':
                foreword = 'Славься, мой господин';
                break;
        }

        if (foreword.length && isAppealAvailable(helloProbability)) {
            await bot.sendMessage(chatId, foreword, {reply_to_message_id: messageId});
        }

        if (text && isMessageHasBadWords(text) && isAppealAvailable(mamaProbability)) {
            await bot.sendMessage(chatId, 'Не ругайся ёпта', {reply_to_message_id: messageId});
        }

        if (text?.charAt(text.length - 1) === '?'
            && message.reply_to_message
            && isAppealAvailable(pidorProbability)) {

            const originalMessageId = message.reply_to_message.message_id;
            const reply = text.slice(0, text.length -1);
            return bot.sendMessage(chatId, reply + ', пидор?', {reply_to_message_id: originalMessageId});
        }

        if ((text && text === 'нет' || text === 'Нет') && isAppealAvailable(faggotAnswerProbability)) {
            return bot.sendMessage(chatId, 'пидора ответ', {reply_to_message_id: messageId});
        }
        if ((text && text === 'да' || text === 'Да') && isAppealAvailable(beardAnswerProbability)) {
            return bot.sendMessage(chatId, 'звизда', {reply_to_message_id: messageId});
        }

        if (isAppealAvailable(randomInsultProbability)) {
            const text = getRandomElement('insults');
            return bot.sendMessage(chatId, text, {reply_to_message_id: messageId});
        }

        if (text === '/start@ldknbot' || text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/9e7/6f5/9e76f5da-9232-3232-9184-81bc5c262a05/2.webp');
            return bot.sendMessage(chatId, 'Welcome!');
        }
        if (text === '/info@ldknbot' || text === '/info') {
            return bot.sendMessage(chatId, 'Bot was created by me just4fun');
        }
        if (text === '/guess@ldknbot' || text === '/guess') {
            return bot.sendMessage(chatId, 'Узнай, какой день будет у тебя сегодня?', predictionOptions);
        }
        if (text === '/randomword@ldknbot' || text === '/randomword') {
            // console.log('hey');
            getPairOfWords().then(words => bot.sendMessage(chatId, `${words[0]}\n${words[1]}`, {reply_to_message_id: messageId}));
        }
        if (text === '/game@ldknbot' || text === '/game') {
            startGame(userId, chatId);
            return;
        }
        if (text === '/randomperson@ldknbot' || text === '/randomperson') {
            sendRandomFace(chatId);
        }
    });
};

const getRandomElement = (type) => {
    const array = config.get(type);
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

const createRandomIndex = (number) => {
    return Math.floor(Math.random() * number);
};

const getStats = (text) => {
    // число в текстовом сообщении, количество элементов массива
    if (!isNaN(text)) {
        let stats = {};

        for (let i = 0; i < +text; i++) {
            stats[i] = 0;
        }

        for (let i = 0; i < 100000; i++) {
            const r = createRandomIndex(+text);
            stats[r] = stats[r] + 1;
        }
        Object.keys(stats).forEach(key => {
            console.log(key, stats[key]);
        })
        console.log('-------------------------');
    }
};

const isAppealAvailable = (appealProbability) => {
    return createRandomIndex(appealProbability) === 0;
};
const isGuessingAvailable = (name, guessings) => {
    if (!guessings[name]) return true;
    const timeout = config.get('guessingTimout');
    const lastGuessTimestamp = guessings[name].lastGuessTimestamp;
    const currentTimestamp = Date.now();
    return !(lastGuessTimestamp && currentTimestamp - lastGuessTimestamp < guessingTimer);
};
const getRemainTimeToGuessing = (name, guessingsTimestamps) => {

    let strHours = '';
    let strMins = '';
    let strSeconds = '';

    const lastGuessTimestamp = guessingsTimestamps[name].lastGuessTimestamp;
    const currentTimestamp = Date.now();
    const remainTime = guessingTimer - (currentTimestamp - lastGuessTimestamp);

    let hours = Math.floor((remainTime / (1000 * 60 * 60)) % 24);
    if (hours) {
        strHours = hours + 'hr ';
    }

    let minutes = Math.floor((remainTime / (1000 * 60)) % 60);
    if (minutes) {
        strMins = minutes + 'min ';
    }

    let seconds = Math.floor((remainTime / 1000) % 60);
    if (seconds) {
        strSeconds = seconds + 'sec ';
    }

    return strHours + strMins + strSeconds;

};

const isMessageHasBadWords = (text) => {
    return badWords.some (badWord => {
        const capitalBadWord = badWord.charAt(0).toUpperCase() + badWord.slice(1);
        return text.includes(badWord) || text.includes(capitalBadWord);
    });
};

start();