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
./translate-macos {fromDir} {toDir} en
fromDir : 你的待翻译文件或者文件夹
toDir: 翻译后的文件或文件夹保存地址
to: 翻译目标语言

例如：
node translate-macos ./a.txt ./en en  把当前目录a.txt翻译至en目录下面
node translate-macos ./zh/ ./en en    把当前目录zh文件夹的所有文档翻译至en目录下面
````



##  使用方式2：必须保证本地装有node环境，下载源文件，执行node install 安装依赖，然后用node执行
````
curl -sLO https://raw.githubusercontent.com/15669072513/translateText/main/src/translate.js
npm install --save  tomsun28/google-translate-api    
````
## 使用 
````
node translate.js {fromDir} {toDir} en
fromDir : 你的待翻译文件或者文件夹
toDir: 翻译后的文件或文件夹保存地址
to: 翻译目标语言
例如：
node translate.js ./a.txt ./en en  把当前目录a.txt翻译至en目录下面
node translate.js ./zh/ ./en en    把当前目录zh文件夹的所有文档翻译至en目录下面
````