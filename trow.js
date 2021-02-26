const cheerio = require('cheerio');

function analyseHtml(html, inloop, url) {
    const $ = cheerio.load(html);
    const a = [];
    url = new URL(url);

    removeUselessHtml($);
    const isLastPage = getIsLastPage($);
    const nowPage = getNowPage($);
    title = $('.maintitle2').find('td').first()?.text();
    // 插入分隔符
    $('.normalname').each(function(i) {
        if (i === 0) return;
        $(this).before('<hr />')
    })

    $('.maintitle2 td:first-child, .postdetails, .normalname, .postcolor3').each(function() {
        let $node = $(this);

        // 处理标题
        if ($node.attr('id') === 'maintitle2') {
            if (inloop) {
                // 跳过，不推入数组
                return;
            } else {
                $node = $(`<h1>${title}</h1>`);
            }
        }

        // 处理图片
        $node.find('img').each(function(i) {
            const $node = $(this);
            const src = $node.attr('src')
            if (!src?.match(/http/)) {
                if (src[0] !== '/') {
                    $node.attr('src', `${url.origin}/board/${src}`);
                } else {
                    $node.attr('src', `${url.origin}${src}`)
                }
            }
        })

        // 处理引用
        $node.find('.quotemain').each(function(i) {
            let $node = $(this);
            $node.prev().after($('<blockquote>').append($node.clone()));
            $node.remove();
        })

        // 推入数组
        a.push($('<div>').append($node.clone()).html());
    });
    return {
        title,
        content: a.join(''),
        isLastPage,
        nowPage,
    }
}

function removeUselessHtml($) {
    $('.postdetails').each(function(i) {
        if ($(this).find('table').length !== 0) {
            $(this).remove();
        }
    })
    $('.quotetop').remove();
}

function getIsLastPage($) {
    return !$('.pagelink').find('a[title="Next page"]').length;
}

function getNowPage($) {
    return +$('.pagecurrent').first().text();
}

module.exports = analyseHtml;