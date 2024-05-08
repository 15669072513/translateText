const core = require('@actions/core');
const { context } = require("@actions/github");
const { translate } = require('bing-translate-api');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
let notCare = getStarted();

async function getStarted() {
    let failed = false;
    try {
        const fromDir = core.getInput('fromDir', { required: true })
        const toDir = core.getInput('toDir', { required: true })
        const to = core.getInput('to', { required: true })
        core.debug("fromdir:" + fromDir);
        core.debug("todir:" + toDir);
        core.debug("to:" + to);

        // var text = "你好" +   "\n";
        // await translateContent(text);
        // await gitclone()
        //
        // await processDirectory("./layotto/docs/zh/", "./layotto/docs/en/","en");
        await processDirectory(fromDir, toDir,to);
        // //
        await gitpush()
        core.info("work  completed");
    } catch (error) {
        core.setFailed(error.message);
    }
    core.setOutput("result", failed ? "FAILED" : "PASSED");
}

async function processDirectory(dirPath, enDirPath,to) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const newEnDirPath = path.join(enDirPath, file);
            fs.mkdirSync(newEnDirPath, { recursive: true });
            await processDirectory(filePath, newEnDirPath);
        } else if (path.extname(file) === '.md') {
            const filePath = path.join(dirPath, file);
            const enFilePath = path.join(enDirPath, file);
            await processFile(filePath, enFilePath,to);
        }
    }
}

async function processFile(filePath, enFilePath,to) {
    core.info("开始翻译文件：" + filePath.toString());
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = splitText(content, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks = [];
    for (const chunk of chunks) {
        const translatedChunk = await translateContent(chunk,to);
        translatedChunks.push(translatedChunk);
    }
    const translatedContent = translatedChunks.join('');
    const dirPath = path.dirname(enFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(enFilePath, translatedContent);
    core.info("写入新的文件："+enFilePath)
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
    core.info("开始休眠")
    await sleep(1)
    core.info("结束休眠")

    let result = '';
    core.info("开始翻译："+body);
    await translate(body, "zh-Hans", to).then(res => {
        result = res.translation;
        core.info("翻译成功："+result);
    }).catch(err => {
       core.error(err);
    });
    return result;
}

async function gitclone() {
    var repoUrl = "git@github.com:15669072513/layotto.git";
    if (fs.existsSync("./layotto")) {
        core.info("目录存在");
        return;
    }
    core.info("开始clone。。。。。。。。。。。。。。。");

    await simpleGit().clone(repoUrl, (err) => {
        if (err) {
           core.error('Error cloning repository:', err);
        } else {
            core.info('Repository cloned successfully');
        }
    });
}

async function gitpush() {
    core.info("开始push。。。。。。。。。。。。。。。");

    const git = simpleGit("./layotto/");
    const branch = "main";
    await git.add(['.'], (addErr) => {
        if (addErr) {
           core.error('添加错误:', addErr);
            return;
        }
        git.commit('提交信息：xxx', (commitErr) => {
            if (commitErr) {
               core.error('提交错误:', commitErr);
                return;
            }
            git.push('origin', branch, (pushErr) => {
                if (pushErr) {
                   core.error('push错误:', pushErr);
                    return;
                }
                core.info('push成功');
            });
        });
    });
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports = {
    getStarted: getStarted
};
