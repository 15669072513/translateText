const translateDir = require('./translate.js');
const simpleGit = require('simple-git');

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
            const fileList = result.split('\n').filter(Boolean).map(file => `${repoPath}/${file}`); // 过滤掉空行
            console.log("最近" + commitDepth + "次提交文件列表：" + fileList)
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
                        resolve(fileList);
                    }
                });
            }
        });
    });
}



