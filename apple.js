const cheerio = require('cheerio');

let floor = 1;

function analyseHtml(html, inloop, url) {
    const $ = cheerio.load(html);
    const a = [];
    url = new URL(url);

    const totalPage = +getTotalPage($);
    const nowPage = getNowPage($);
    removeUselessHtml($);

    $('#top_subject, .post, .poster, .attachments').each(function() {
        let $node = $(this);

        // 处理标题
        if ($node.attr('id') === 'top_subject') {
            if (inloop) {
                // 跳过，不推入数组
                return;
            } else {
                $node = $(`<h1>${$node.text()}</h1>`);
            }
        }

        // 处理图片
        $node.find('img').each(function(i) {
            const $node = $(this);
            const src = $node.attr('src')
            if (!src?.match(/http/)) {
                if (src[0] === '?') {
                    $node.attr('src', `${url.origin}${url.pathname}${src}`);
                } else {
                    $node.attr('src', `${url.origin}${src}`)
                }
            }
        })

        // 处理a
        $node.find('a').each(function(i) {
            const $node = $(this);
            if (!$node.attr('href')?.match(/http/)) {
                $node.attr('href', `${url.origin}${url.pathname}${$node.attr('href')}`);
            }
        })

        // 处理poster
        if ($node.hasClass('poster')) {
            $node = $node.find('h4 a:last-child');
            $node.text(`#${floor++} ` + $node.text());
            if (floor !== 1) a.push('<hr />');
        }

        // 推入数组
        a.push($('<div>').append($node.clone()).html());
    });

    return {
        title: $('#top_subject').text(),
        content: a.join(''),
        totalPage,
        nowPage,
    }
}

function removeUselessHtml($) {
    // $('hr').remove();
}

function getTotalPage($) {
    return +$('.navPages').eq(-2).text();
}

function getNowPage($) {
    return +$('.pagelinks').last().find('strong').first().text();
}

module.exports = analyseHtml;