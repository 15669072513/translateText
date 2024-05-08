const core = require('@actions/core');
const axios = require('axios');
const { context } = require("@actions/github");
const { translate } = require('bing-translate-api');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
let notCare = getStarted();

async function getStarted() {
    let failed = false;
    try {
        // 从参数获取branch和codeRepo
        // const branchName = process.env.GITHUB_HEAD_REF;
        // const branch = branchName.replace('refs/heads/', '')
        // const codeRepo = context.payload.pull_request.head.repo.ssh_url;

        const fromDir = core.getInput('fromDir', { required: true })
        const toDir = core.getInput('toDir', { required: true })
        // const to = core.getInput('to', { required: true })
        core.debug("fromdir:" + fromDir);
        core.debug("to:" + to);

        // var text = "你好" +   "\n";
        // await translateContent(text);
        await gitclone()
        //
        // await processDirectory("./layotto/docs/zh/", "./layotto/docs/en/");
        await processDirectory(fromDir, toDir);
        // //
        await gitpush()
        core.info("work  completed");
    } catch (error) {
        core.setFailed(error.message);
    }
    core.setOutput("result", failed ? "FAILED" : "PASSED");
}

async function processDirectory(dirPath, enDirPath) {
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
            await processFile(filePath, enFilePath);
        }
    }
}

async function processFile(filePath, enFilePath) {
    core.info("开始翻译文件：" + filePath.toString());
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = splitText(content, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks = [];
    for (const chunk of chunks) {
        const translatedChunk = await translateContent(chunk);
        translatedChunks.push(translatedChunk);
    }
    const translatedContent = translatedChunks.join('');
    const dirPath = path.dirname(enFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(enFilePath, translatedContent);
    console.log("写入新的文件："+enFilePath)
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

async function translateContent(body) {
    console.log("开始休眠")
    await sleep(1)
    console.log("结束休眠")

    let result = '';
    console.log("开始翻译："+body);
    await translate(body, "zh-Hans", 'en').then(res => {
        result = res.translation;
        console.log("翻译成功："+result);
    }).catch(err => {
        console.error(err);
    });
    return result;
}

async function gitclone() {
    var repoUrl = "git@github.com:15669072513/layotto.git";
    if (fs.existsSync("./layotto")) {
        console.log("目录存在");
        return;
    }
    console.log("开始clone。。。。。。。。。。。。。。。");

    await simpleGit().clone(repoUrl, (err) => {
        if (err) {
            console.error('Error cloning repository:', err);
        } else {
            console.log('Repository cloned successfully');
        }
    });
}

async function gitpush() {
    console.log("开始push。。。。。。。。。。。。。。。");

    const git = simpleGit("./layotto/");
    const branch = "main";
    await git.add(['.'], (addErr) => {
        if (addErr) {
            console.error('添加错误:', addErr);
            return;
        }
        git.commit('提交信息：xxx', (commitErr) => {
            if (commitErr) {
                console.error('提交错误:', commitErr);
                return;
            }
            git.push('origin', branch, (pushErr) => {
                if (pushErr) {
                    console.error('push错误:', pushErr);
                    return;
                }
                console.log('push成功');
            });
        });
    });
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

module.exports = {
    getStarted: getStarted,
    processDirectory: processDirectory
};
