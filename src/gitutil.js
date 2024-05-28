const simpleGit = require('simple-git');

let files = getLatestCommitFileList("/Users/liuhq/translateText")
console.log("最新的文件列表"+files)

function getLatestCommitFileList(repoPath) {
    const git = simpleGit(repoPath);
    // 获取最新提交的改动文件列表11
    let diff = git.diff(['HEAD~1', 'HEAD', '--name-only'], (error, result) => {
        if (error) {
            console.error(error)
        } else {
            // 提取改动的文件列表
            const fileList = result.split('\n').filter(Boolean); // 过滤掉空行
            console.log(fileList)
            return fileList;
        }
    });
    return diff;
}


module.exports = {
    getLatestCommitFileList: getLatestCommitFileList
};
