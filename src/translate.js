const { translate } = require('bing-translate-api');
const fs = require('fs');
const fsp = require('fs/promises');
const GoogleTranslate = require('@tomsun28/google-translate-api')

const path = require('path');

async function translateDir(fromDir, toDir, to) {
    try {
        console.info("fromdir:" + fromDir);
        console.info("todir:" + toDir);
        console.info("to:" + to);
        await processDirectory(fromDir, toDir,to);
        console.info("work  completed");
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
    const chunks = splitText(content, 1000);
    console.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks = [];
    for (const chunk of chunks) {
        const translatedChunk = await translateContent(chunk,to);
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
    console.info("开始休眠")
    await sleep(100)
    console.info("结束休眠")

    let result = '';
//     body = "## 社区\n" +
//         "\n" +
//         "| 平台                                               | 联系方式                                                                                                                                                     |\n" +
//         "| :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |\n" +
//         "| 💬 [钉钉](https://www.dingtalk.com/zh) (用户群)     | 群号: 31912621 或者扫描下方二维码 <br> <img src=\"https://gw.alipayobjects.com/mdn/rms_5891a1/afts/img/A*--KAT7yyxXoAAAAAAAAAAAAAARQnAQ\" height=\"200px\"> <br> |\n" +
//         "| 💬 [钉钉](https://www.dingtalk.com/zh) (社区会议群) | 群号：41585216 <br> [Layotto 在每周五晚 8 点进行社区会议，欢迎所有人](zh/community/meeting.md)                                                               |\n";
//     // 使用正则表达式匹配<img>标签中的内容
//     const imgRegex: RegExp = /<img[^>]+>/g;
//     const matches: string[] = body.match(imgRegex) || [];
// // 替换匹配到的内容
//     let replacedString: string = chunk;
//     matches.forEach((match: string, index: number) => {
//         replacedString.replace(match, `{$${index}}`);
//     });
    console.info("开始翻译："+body);


    await GoogleTranslate(body, {to: 'en'}).then(res => {
        console.log("翻译成功："+res.text);
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

// 把替换后的字符串变回原来的样子
// matches.forEach((match: string, index: number) => {
//     result = result?.replace(`{$${index}}`, match);
// });

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1));
}

module.exports = {
    translateDir: translateDir
};
