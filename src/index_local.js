const translateDir = require('./translate.js');

let notCare = translateLocal();

async function translateLocal() {
    try {
        const args = process.argv.slice(2);
        const fromDir = args[0]
        const toDir = args[1]
        const to =  typeof args[2]==="undefined"?"en": args[2]
        console.info("fromDir:" + fromDir);
        console.info("toDir:" + toDir);
        console.info("to:" + to);
        await translateDir.translateDir(fromDir,toDir,to)

        console.info("work  completed");
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = {
    translateLocal: translateLocal
};
