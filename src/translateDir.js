const translateDir = require('./translate.js');
let notCare = translateLocal();

async function translateLocal() {
    try {
        const args = process.argv.slice(2);
        const fromDir = args[0]
        const toDir = args[1]
        const to =  typeof args[2]==="undefined"?"en": args[2]
        console.info("待翻译文件夹:" + fromDir);
        console.info("翻译至文件夹:" + toDir);
        console.info("翻译语言:" + to);
        await translateDir(fromDir,toDir,to)
        console.info("翻译完成！");
    } catch (error) {
        console.error(error.message);
    }
}
