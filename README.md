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
````



##  使用方式2：必须保证本地装有node环境，下载源文件，用node执行,跨操作系统
````
curl -sLO https://raw.githubusercontent.com/15669072513/translateText/main/src/translate.js
````
## 使用 
````
node translate.js {fromDir} {toDir} en
fromDir : 你的待翻译文件或者文件夹
toDir: 翻译后的文件或文件夹保存地址
to: 翻译目标语言
````