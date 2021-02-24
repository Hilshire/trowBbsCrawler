const cheerio = require('cheerio');

let floor = 0;

function analyseHtml(html, inloop) {
    const $ = cheerio.load(html);
    const a = [];

    $('#top_subject, .post, .poster, hr').each(function() {
        let $node = $(this);

        // 推入数组
        a.push($('<div>').append($node.clone()).html());
    });

    return {
        title: $('#top_subject').text(),
        content: a.join(''),
        totalPage: 1,
    }
}

module.exports = analyseHtml;