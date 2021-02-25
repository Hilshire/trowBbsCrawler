const cheerio = require('cheerio');

let floor = 1;

function analyseHtml(html, inloop, url) {
    const $ = cheerio.load(html);
    const a = [];

    removeUselessHtml($);

    // 处理图片
    url = new URL(url);
    $('img').each(function(i) {
        const $node = $(this);
        if (!$node.attr('src')?.match(/http/)) {
            $node.attr('src', `${url.origin}${$node.attr('src')}`);
        }
    })

    $('#top_subject, .post, .poster').each(function() {
        let $node = $(this);

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
        totalPage: 1,
    }
}

function removeUselessHtml($) {
    // $('hr').remove();
}

module.exports = analyseHtml;