const cheerio = require('cheerio');

let floor = 0;

function analyseHtml(html, inloop) {
    const $ = cheerio.load(html);
    const a = [];

    removeUselessHtml($);
    const totalPage = +getTotalPage($);
    const nowPage = getNowPage($);
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
        a.push($('<div>').append($node.clone()).html());
    });
    return {
        title: $('#thread_subject').text(),
        content: a.join(''),
        totalPage,
        nowPage,
    }
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

function getNowPage($) {
    return +$('.pg').first().find('strong').text()
}

module.exports = analyseHtml;