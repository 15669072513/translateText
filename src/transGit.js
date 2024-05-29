const simpleGit = require('simple-git');
const fs = require('fs');
const GoogleTranslate = require('@tomsun28/google-translate-api')
const path = require('path');


 let promise = transFromGitCommit();

async function transFromGitCommit(){
    try {
        const args = process.argv.slice(2);
        //commit 深度，默认最新的commit记录
        const gitDir = args[0]
        const toDir = args[1]
        const commitDepth = args[2]
        const to =  typeof args[3]==="undefined"?"en": args[3]
        console.info("Git仓库路径:" + gitDir);
        console.info("最近几次提交:" + commitDepth);
        console.info("翻译至文件夹:" + toDir);
        console.info("翻译语言:" + to);
        await doTransFromGitCommit(gitDir,toDir,commitDepth,to)
        console.info("翻译完成！");
    } catch (error) {
        console.error(error.message);
    }

}

async function doTransFromGitCommit(repoPath, toDir,commitDepth, to) {
    if(!commitDepth){
        commitDepth="1";
    }

    const git = simpleGit(repoPath);
    // 获取最新提交的改动文件列表
    git.diff(['HEAD~'+commitDepth, 'HEAD', '--name-only'], async (error, result) => {
        if (error) {
            console.error(error)
        } else {
            // 提取改动的文件列表
            const fileListOrigin = result.split('\n').filter(Boolean).map(file => `${file}`); // 过滤掉空行
            const fileList = new Set(fileListOrigin)
            console.log("最近" + commitDepth + "次提交文件列表：" + fileList.size)
            //循环翻译
            for (const file of fileList) {
                console.log(file); // 打印每个文件路径
                await translateDir(file, toDir, to)
            }
        }
    });


}



function getFileListForLatestCommit(commitDepth,repoPath) {
    const git = simpleGit(repoPath);
    return new Promise((resolve, reject) => {
        git.log(['-'+commitDepth, '--name-only'], (error, result) => {
            if (error) {
                reject(error);
            } else {
                const latestCommitId = result.latest.hash;
                git.show([latestCommitId, '--name-only'], (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        const fileList = result.trim().split('\n').map(file => `${repoPath}/${file}`); // 过滤掉空行
                        let setList = new Set(fileList)
                        console.log("setl列表："+setList)
                        resolve(setList);
                    }
                });
            }
        });
    });
}


//--------------------------------其他module内容，方便编译------------------------------------------

async function translateDir(dirPath, enDirPath, to) {
    if (!fs.existsSync(dirPath)) {
        console.warn('文件不存在，跳过');
        return;
    }
    let isFile = await checkFile(dirPath);
    let split = dirPath.split("/");
    if(isFile){
        await processFile(dirPath, enDirPath+"/"+split[split.length-1],to);
        return;
    }

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const newEnDirPath = path.join(enDirPath, file);
            fs.mkdirSync(newEnDirPath, { recursive: true });
            await translateDir(filePath, newEnDirPath);
        } else  {
            const filePath = path.join(dirPath, file);
            const enFilePath = path.join(enDirPath, file);
            await processFile(filePath, enFilePath,to);
        }
    }
}
async function checkFile(path) {
    try {
        const stats = await fs.promises.stat(path);
        return stats.isFile();
    } catch (error) {
        console.error('发生错误：', error);
        return false; // 发生错误时，返回false
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


// 把一些特殊字符替换成转义字符
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
        result = result.replace(`{$${index}}`, match);
    });
    return result;
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

    // bing 翻译
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





