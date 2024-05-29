![](./assets/logo.svg)
# translateText

文档翻译工具，可以在你本地把你的文件或者文件夹里面的全部文档翻译成英文或者其他语言


# 使用
有2种使用方式：
## 使用方式1：可执行文件，文件下载有点慢，首先确定你的操作系统，然后下载对应的文件，本次构建有linux macos win.exe 3个版本
````
curl -sLO https://raw.githubusercontent.com/15669072513/translateText/main/translate-{macos|linux|win.exe}
````
## 直接执行下载好的文件，假如你的文件系统是macos
````
./translate-macos {gitRepoDir} {toDir} {commitDepth} {en} 
gitRepoDir : git项目地址，必填
toDir: 翻译后的文件或文件夹保存地址，必填
commitDepth: commit最近第几次提交，默认最近1次，即最新的提交记录，必填
to: 翻译目标语言，选填，默认英文en
例如：
translate-macos ./aa ./aa/en 1 en  把aa文件夹里面根据最近1次的提交记录，把变动文件翻译到aa/en目录里面
````

##  使用方式2：必须保证本地装有node环境，下载源文件，执行node install 安装依赖，然后用node执行
````
curl -sLO https://raw.githubusercontent.com/15669072513/translateText/main/src/transGit.js
npm install --save  tomsun28/google-translate-api    simple-git
````
## 使用 
````
node transGit.js {gitRepoDir} {toDir} {commitDepth} {en} 
gitRepoDir : git项目地址，必填
toDir: 翻译后的文件或文件夹保存地址，必填
commitDepth: commit最近第几次提交，默认最近1次，即最新的提交记录，必填
to: 翻译目标语言，选填，默认英文en
例如：
node transGit.js ./aa ./aa/en 1 en  把aa文件夹里面根据最近1次的提交记录，把变动文件翻译到en目录里面
````