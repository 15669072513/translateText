const { translate } = require('bing-translate-api');
const fs = require('fs');
const fsp = require('fs/promises');
const GoogleTranslate = require('@tomsun28/google-translate-api')
const path = require('path');

let notCare = translateLocal();

async function translateLocal() {
    try {
        const args = process.argv.slice(2);
        const fromDir = args[0]
        const toDir = args[1]
        const to =  typeof args[2]==="undefined"?"en": args[2]
        console.info("待翻译文件夹:" + fromDir);
        console.info("翻译至文件夹:" + toDir);
        console.info("翻译语言:" + to);
        await translateDir(fromDir,toDir,to)
        console.info("翻译完成！");
    } catch (error) {
        console.error(error.message);
    }
}

// replaceTrans
async function replaceTrans(body,to) {
    const imgRegex = /<img[^>]+>/g;
    const matches = body.match(imgRegex) || [];
// 替换匹配到的内容
    let replacedString = body;
    matches.forEach((match, index) => {
        // console.debug("开始替换："+match)
        replacedString = replacedString.replace(match, `{$${index}}`);
    });
    // console.debug("翻译原文："+replacedString)
    let result = await translateContent(replacedString,to);
    // 把替换后的字符串变回原来的样子
    matches.forEach((match, index) => {
        // console.debug("替换回来："+match)
        result = result?.replace(`{$${index}}`, match);
    });
    return result;
}




//---------------------------------------------------
async function translateDir(fromDir, toDir, to) {
    try {
        await processDirectory(fromDir, toDir,to);
    } catch (error) {
        console.error(error.message);
    }
}
async function checkFile(path) {
    try {
        const stats = await fsp.stat(path);
        return stats.isFile();
    } catch (error) {
        console.error('发生错误：', error);
        return false; // 发生错误时，返回false
    }
}

async function processDirectory(dirPath, enDirPath,to) {

    let isFile = await checkFile(dirPath);
    if(isFile){
        await processFile(dirPath, enDirPath,to);
        return;
    }
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const newEnDirPath = path.join(enDirPath, file);
            fs.mkdirSync(newEnDirPath, { recursive: true });
            await processDirectory(filePath, newEnDirPath);
        // } else  if (path.extname(file) === '.md') {
        } else  {
            const filePath = path.join(dirPath, file);
            const enFilePath = path.join(enDirPath, file);
            await processFile(filePath, enFilePath,to);
        }
    }
}

async function processFile(filePath, enFilePath,to) {
    console.info("开始翻译文件：" + filePath.toString());
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = splitText(content, 1500);
    console.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks = [];
    for (const chunk of chunks) {
        const translatedChunk = await replaceTrans(chunk,to);
        translatedChunks.push(translatedChunk);
    }
    const translatedContent = translatedChunks.join('');
    const dirPath = path.dirname(enFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(enFilePath, translatedContent);
    console.info("写入新的文件："+enFilePath)
}

function splitText(text, chunkSize) {
    const chunks = [];
    let currentChunk = '';
    for (const char of text) {
        currentChunk += char;
        if (currentChunk.length >= chunkSize) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}

async function translateContent(body,to) {
    // console.debug("开始休眠")
    await sleep(1000)

    let result = '';
    await GoogleTranslate(body, {to: to}).then(res => {
        console.debug("分段翻译成功："+res.text);
        result = res.text
    }).catch(err => {
        console.error(err);
    });

    // await translate(body, "zh-Hans", to).then(res => {
    //     result = res.translation;
    //     console.info("翻译成功："+result);
    // }).catch(err => {
    //     console.error(err);
    // });
    return result;
}



function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1));
}

module.exports = {
    translateDir: translateDir
};
