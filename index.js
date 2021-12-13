const fs = require('fs');
const axios = require('axios').default;
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm')
const rules = require('./rules');
const TYPE = require('./type');
const analyseS1Html = require('./s1');
const analyseAppleHtml = require('./apple');
const analyseTrowHtml = require('./trow');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm)

const error = console.error;
const log = console.log;

const sections = [];
let fileName;

function main() {
    try {
        const url = getUrl();
        const type = getUrlType(url);
    
        addTrundownRule(type);
    
        if (!checkoutUrl(url)) {
            error('非法的S1url！');
            process.exit();
        }
        loadData(url).catch(error).finally(async () => {
            await htmlToMd(fileName, url).then(() => console.log('写入完毕'), console.error);
            process.exit();
        });
    } catch (e) {
        error(e)
    }
}

async function loadData(url, inloop) {
    !inloop && log('开始读取URL: ', url);
    const type = getUrlType(url);
    return axios.get(url, {
        headers: {
            Cookie: "B7Y9_2132_st_p=230654%7C1614760200%7C75a3809e9ad877d5d3d25502aaa5ca8b; __cfduid=d8da9c09efacdc602a65de3613ff672b51614760025; B7Y9_2132_sendmail=1; B7Y9_2132_auth=597c%2BIe5eLBkdinqtx37%2FCCIQUclr5D7HRX7mROA%2BcIV2UffuC0uMparx84K93eTHWHDdf%2FYdkvAHN4vWm8zORi9lEc;B7Y9_2132_saltkey=Y4vvplGJ; _uab_llina=158683738657479403330428; __gads=ID=b24e5e71a30cd210:T=1586837386:S=ALNI_MYv2SZH_bMepjm_FXob7PJtcfJy1g; _ga=GA1.2.1066723789.1586837387; UM_distinctid=1752122baf9250-0b733103853c1c-193b6152-1fa400-1752122bafaab8; B7Y9_2132_popadv=a%3A0%3A%7B%7D; B7Y9_2132_lastvisit=1614063304; B7Y9_2132_lastcheckfeed=230654%7C1614066924; B7Y9_2132_smile=1465D1; B7Y9_2132_nofavfid=1; B7Y9_2132_yfe_in=1; B7Y9_2132_pc_size_c=0; B7Y9_2132_myrepeat_rr=R0; B7Y9_2132_ulastactivity=1497quHKLaINyjDRUb2rehni90jRKpP%2Fnr40ZiCSQ5QmtaAC1TVx; CNZZDATA1260281688=1846755922-1586836876-%7C1614758867; B7Y9_2132_noticeTitle=1; _gid=GA1.2.1634581504.1614760028; B7Y9_2132_visitedfid=50D4D75D6; B7Y9_2132_st_t=230654%7C1614760068%7C4261403fa40a306056a9a2f57e294f7f; B7Y9_2132_forum_lastvisit=D_75_1614327138D_4_1614760035D_50_1614760068; B7Y9_2132_viewid=tid_979598; B7Y9_2132_sid=O9A9a4; B7Y9_2132_lip=58.240.94.148%2C1614760156; B7Y9_2132_lastact=1614760227%09forum.php%09viewthread; B7Y9_2132_st_p=230654%7C1614760200%7C75a3809e9ad877d5d3d25502aaa5ca8b",
            // Cookie: "SMFCookieElle=a%3A4%3A%7Bi%3A0%3Bs%3A5%3A%2293165%22%3Bi%3A1%3Bs%3A40%3A%220ada4eb9f1a59cb24666063380270392f683ffb9%22%3Bi%3A2%3Bi%3A1782202437%3Bi%3A3%3Bi%3A1%3B%7D; PHPSESSID=57248fba3794525afa45f156833ec2b0; _ga=GA1.2.1067634019.1592904555; _gid=GA1.2.1665109043.1614157869",
        }
    }).then(async res => {
        try {
            let result;
            switch (type) {
                case TYPE.S1:
                    result = analyseS1Html(res.data, inloop, url);
                    break;
                case TYPE.APPLE:
                    result = analyseAppleHtml(res.data, inloop, url);
                    break;
                case TYPE.TROW:
                    result = analyseTrowHtml(res.data, inloop, url);
            }
            const { totalPage, nowPage, content, title, isLastPage } = result;
            fileName = title;
            sections.push(content);
            if (!inloop) {
                switch (type) {
                    case TYPE.S1:
                        await s1Loop(totalPage, nowPage, url);
                        break;
                    case TYPE.APPLE:
                        await appleLoop(totalPage, nowPage, url);
                        break; 
                    case TYPE.TROW:
                        await trowLoop(isLastPage, nowPage, url);
                        break;
                }
            }

            return result;
        } catch (e) {
            error(e);
        }
    }).catch(error);
}

function getUrl() {
    const args = process.argv.slice(2);
    return args[0];
}

function getUrlType(url) {
    if (url.match(/saraba1st/)) return TYPE.S1;
    if (url.match(/goddessfantasy/)) return TYPE.APPLE;
    if (url.match(/trow/)) return TYPE.TROW;
}

function checkoutUrl(url) {
    if (url) {
        return true;
    }
}

function addTrundownRule(type) {
    const rule = rules[type]
    if (!rule) return;
    Object.keys(rule).forEach(key => {
        turndownService.addRule(key, rule[key]);
    });
}

async function htmlToMd(fileName, url) {
    if (sections.length === 0) 
        throw new Error('获取内容为空');
    
    log('开始转换MD')
    sections.push(`<h5>原帖地址：${url}</h5>`);
    fs.writeFile(`./result/${fileName}.html`, sections.join(''), err => console.error);
    const markdown = turndownService.turndown(sections.join(''));
    return new Promise((resolve, reject) => {
        log(`开始写入文件: ${fileName || 'empty'}.md`);
        if (/主题: /.exec(fileName)) {
            fileName = fileName.replace(/主题: /, '')
            fileName = fileName.replace('/', '-')
        }
        fs.writeFile(`./result/${fileName}.md`, markdown, function(err) {
            if (err) { reject(err) }
            resolve();
        });
    });
}

async function s1Loop(total, now, url) {
    const REG = /(.+thread-\d+-)(\d+)(-\d+.+)/;
    while (now && now < total) {
        const newUrl = url.replace(REG, (match, p1, p2, p3) => p1 + ++now + p3);
        log('读取新url: ', newUrl, '页数: ', +now, '总页数: ', total);
        await loadData(newUrl, true);
    }
}

async function appleLoop(total, now, url) {
    const REG = /(.+topic=\d+\.)(\d+)/
    while (now && now < total) {
        now++;
        const newUrl = url.replace(REG, (match, p1, p2) => p1 + (now-1) * 20);
        log('读取新url: ', newUrl, '页数: ', +now, '总页数: ', total);
        await loadData(newUrl, true);
    } 
}

async function trowLoop(isLastPage, now, url) {
    const REG = /.+st=(\d+)/
    while (!isLastPage) {
        now++;
        const newUrl = url.match(REG) ? url.replace(/(?<=st=)\d+/, (now - 1) * 15) : url + '&st=' + (now - 1) * 15;
        log('读取新url: ', newUrl, '页数: ', +now);
        const result = await loadData(newUrl, true);
        isLastPage = result.isLastPage;
    }  
}

main();