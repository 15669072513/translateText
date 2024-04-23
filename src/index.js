const core = require('@actions/core');
const axios = require('axios');
const jobProcessors = require('./jobprocessors/processors');
const {context} = require("@actions/github");
const translate =  require('@tomsun28/google-translate-api')
const fs = require('fs');
const path = require('path');

let notCare = getStarted();
async function getStarted() {
    let failed = false;
    try {
        // const spaceId = `600095`;
        // const projectId = `19500036`;
        // 从参数获取branch和codeRepo
        // const branchName = process.env.GITHUB_HEAD_REF;
        // const branch = branchName.replace('refs/heads/','')
        // const codeRepo = context.payload.pull_request.head.repo.ssh_url;
        // const codeType = process.env.INPUT_SCAN_TYPE;
        const fromDir = core.getInput('fromDir', { required: true })
        const toDir = core.getInput('toDir', { required: true })
        const to = core.getInput('to', { required: true })
        core.debug("fromdir:" + fromDir);
        core.debug("to:" + to);

        await processDirectory(fromDir, toDir);

        core.info("translate  completed");

    } catch (error) {
        core.setFailed(error.message);
    }
    core.setOutput("result", failed ? "FAILED" : "PASSED");
}

async function translateIssueOrigin(body)  {
    let result = ''
    await translate(body, {to: 'en'})
        .then(res => {
            if (res.text !== body) {
                result = res.text
            }
        })
        .catch(err => {
            core.error(err)
            core.setFailed(err.message)
        })
    return result
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
    core.info("开始翻译文件："+filePath.toString())
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = splitText(content, 2000);

    const translatedChunks = [];
    for (const chunk of chunks) {
        const translatedChunk = await translateIssueOrigin(chunk);
        translatedChunks.push(translatedChunk);
    }

    const translatedContent = translatedChunks.join('');
    fs.writeFileSync(enFilePath, translatedContent);
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
module.exports = {
    getStarted:getStarted,
    processDirectory:processDirectory
};

