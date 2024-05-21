const core = require('@actions/core');
const { context } = require("@actions/github");
const fs = require('fs');
const simpleGit = require('simple-git');
const translateDir = require('translate.js');
let notCare = getStarted();
//action 文件
async function getStarted() {
    let failed = false;
    try {
        const fromDir = core.getInput('fromDir', { required: true })
        const toDir = core.getInput('toDir', { required: true })
        const to = core.getInput('to', { required: true })
        const gitToken = core.getInput('gitToken', { required: true })
        // 从参数获取branch和codeRepo
        const repository = process.env.GITHUB_REPOSITORY;
        const eventPath = process.env.GITHUB_EVENT_PATH
// 读取文件内容
        fs.readFile(eventPath, 'utf8', (err, data) => {
            if (err) {
                core.error(err);
                return;
            }
            // 打印内容
            core.info("事件内容："+data);
        });
        core.info("repository:" + repository);
        core.info("fromdir:" + fromDir);
        core.info("todir:" + toDir);
        core.info("to:" + to);
        core.info("gitToken:" + gitToken);

        await gitclone()

        await translateDir.translateDir(fromDir, toDir, to)
        // //
        await gitpush()
        core.info("work  completed");
    } catch (error) {
        core.setFailed(error.message);
    }
    core.setOutput("result", failed ? "FAILED" : "PASSED");
}

async function gitclone() {
    const branchName = process.env.GITHUB_HEAD_REF;
    const branch = branchName.replace('refs/heads/', '')
    const codeRepo = context.payload.pull_request
    const giToken = core.getInput('gitToken', { required: true })
    core.info("branch:" + branch);
    core.info("codeRepo:" + codeRepo);
    var repoUrl = "https://"+giToken+"@github.com/15669072513/layotto-simple.git";
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

    const git = simpleGit("./");
    const branch = "en";
    await git.checkoutLocalBranch('en',(addErr) => {
        core.info("切换en分支")
     git.add(['.'], (addErr) => {
         core.info("Git添加")

        if (addErr) {
           core.error('添加错误:', addErr);
            return;
        }
        git.commit('提交信息：xxx', (commitErr) => {
            core.info("Git提交")

            if (commitErr) {
               core.error('提交错误:', commitErr);
                return;
            }
            git.push('origin', branch, (pushErr) => {
                core.info("Git 上传")

                if (pushErr) {
                   core.error('push错误:', pushErr);
                    return;
                }
                core.info('push成功');
            });
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
