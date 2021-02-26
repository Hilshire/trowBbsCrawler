const cheerio = require('cheerio');


function analyseHtml(html, inloop) {
    const $ = cheerio.load(html);
    const a = [];

    removeUselessHtml($);
    const isLastPage = getIsLastPage($);
    const nowPage = getNowPage($);
    title = $('.maintitle2').find('td').first()?.text();
    // 插入分隔符
    $('.normalname').each(function(i) {
        if (i === 0) return;
        $(this).before('<hr />')
    })

    $('.maintitle2, postdetails, .normalname, .postcolor3').each(function() {
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
    $('postdetails').each(function(i) {
        if ($(this).find('table')) {
            $(this).remove();
        }
    })
}

function getIsLastPage($) {
    return !$('.pagelink').find('a[title="Next page"]').length;
}

function getNowPage($) {
    return +$('.pagecurrent').first().text();
}

module.exports = analyseHtml;