const fs = require('fs');
const axios = require('axios').default;
const TurndownService = require('turndown');
const cheerio = require('cheerio');
const rules = require('./rules');

const turndownService = new TurndownService();
turndownService.addRule('username', rules.username);

const error = console.error;
const log = console.log;

const sections = [];
let title;

let floor = 0;

function main() {
    const url = getUrl();
    if (!checkoutUrl(url)) {
        error('非法的S1url！');
        process.exit();
    }
    loadData(url).finally(async () => {
        await htmlToMd(title)
            .then(() => console.log('写入完毕'), console.error);
        process.exit();
    });
}

async function loadData(url, inloop) {
    !inloop && log('开始读取URL: ', url);
    return axios.get(url, {
        headers: {
            Cookie: "_uab_collina=158683738657479403330428; __gads=ID=b24e5e71a30cd210:T=1586837386:S=ALNI_MYv2SZH_bMepjm_FXob7PJtcfJy1g; _ga=GA1.2.1066723789.1586837387; UM_distinctid=1752122baf9250-0b733103853c1c-193b6152-1fa400-1752122bafaab8; __yjs_duid=1_735f0c6ae9ddf3ddd8aa5a8dcb3395d91611803175547; __cfduid=d8f5b75fd347020be4b28fa89555f3a321612080862; _gid=GA1.2.1805715101.1613962860; B7Y9_2132_pc_size_c=0; B7Y9_2132_popadv=a%3A0%3A%7B%7D; B7Y9_2132_sid=fHf1Yo; B7Y9_2132_saltkey=Y4vvplGJ; B7Y9_2132_lastvisit=1614063304; CNZZDATA1260281688=1846755922-1586836876-%7C1614065588; B7Y9_2132_viewid=tid_1989200; B7Y9_2132_ulastactivity=8531dmG6IQT9fpx%2F5fcwVIERijI8jfJhw47%2F8etcelMaxiaVleJf; B7Y9_2132_auth=597c%2BIe5eLBkdinqtx37%2FCCIQUclr5D7HRX7mROA%2BcIV2UffuC0uMparx84K93eTHWHDdf%2FYdkvAHN4vWm8zORi9lEc; B7Y9_2132_lastcheckfeed=230654%7C1614066924; B7Y9_2132_lip=58.240.94.148%2C1614066903; B7Y9_2132_yfe_in=1; B7Y9_2132_st_p=230654%7C1614066924%7C3c1fcd69c9a74de38938456a1a280f1e; B7Y9_2132_visitedfid=75; B7Y9_2132_myrepeat_rr=R0; B7Y9_2132_smile=1465D1; B7Y9_2132_nofavfid=1; B7Y9_2132_lastact=1614067755%09forum.php%09"
        }
    }).then(async res => {
        try {
            const { totalPage } = analyseHtml(res.data, inloop);
            if (!inloop) {
                await loop(totalPage, url);
            }
        } catch (e) {
            error(e);
        }
    }).catch(error);
}

function getUrl() {
    const args = process.argv.slice(2);
    return args[0];
}

function checkoutUrl(url) {
    if (url) {
        return true;
    }
}

function analyseHtml(html, inloop) {
    const $ = cheerio.load(html);

    removeUselessHtml($);
    const totalPage = +getTotalPage($);
    title = $('#thread_subject').text();
    // 插入分隔符
    $('.xw1').each(function(i) {
        if (i === 0) return;
        $(this).before('<hr />')
    })
    // 修饰id与楼层
    $('.xw1').each(function(i) {
        if (floor === 0) return floor++;
        $(this).text(`#${floor++}. ` + $(this).text())
    })
    $('#thread_subject, .pcb, .xw1, hr').each(function() {
        let $node = $(this);

        // 处理标题
        if ($node.attr('id') === 'thread_subject') {
            if (inloop) {
                // 跳过，不推入数组
                return;
            } else {
                $node = $(`<h1>${$node.text()}</h1>`);
            }
        }

        // 处理图片
        $node.find('img').each(function() {
            if ($(this).attr('file')) {
                $(this).attr('src', $(this).attr('file'))
            }
        })

        // 推入数组
        sections.push($('<div>').append($node.clone()).html());
    });
    return {
        title: $('#thread_subject').text(),
        content: sections.join(''),
        totalPage,
    }
}

async function htmlToMd(title) {
    log('开始转换MD')
    fs.writeFile(`./${title}.html`, sections.join(''), err => console.error);
    const markdown = turndownService.turndown(sections.join(''));
    return new Promise((resolve, reject) => {
        log(`开始写入文件: ./${title || 'empty'}.md`);
        fs.writeFile(`./${title}.md`, markdown, function(err) {
            if (err) { reject(err) }
            resolve();
        });
    });
}

function removeUselessHtml($) {
    $('.rate').remove();
    $('h3.psth').remove();
    $('p.mbn').remove();
    $('.tip').remove();
}

function getTotalPage($) {
    const text = $('#pgt').find('span').attr('title');
    return text.match(/\d+/)[0];
}

async function loop(total, url) {
    const REG = /(.+thread-\d+-)(\d+)(-\d+.+)/;
    let now = +REG.exec(url)[2];
    while (now < total) {
        now++;
        const newUrl = url.replace(REG, (match, p1, p2, p3) => p1 + now + p3);
        log('读取新url: ', newUrl, '页数: ', +now, '总页数: ', total);
        await loadData(newUrl, true);
    }
}

main();