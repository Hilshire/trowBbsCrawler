const $ = require('cheerio');
const TYPE = require('./type');

const s1Rules = {
    username: {
        filter: 'a',
        replacement: function(content, node) {
            if (node.classList[0] === 'xw1') {
                return '###### ' + '<i style="color=#999">' + content + '</i>';              
            }
            return '<i style="color=#999">' + content + '</i>';
        },
    }
};

const appleRules = {
    username: {
        filter: 'a',
        replacement: function(content, node) {
            const $node = $(node.outerHTML)
            if ($node.attr('title')?.match(/检视会员资料/)) {
                return '###### ' + `[${content}](${$node.attr('href')})`;              
            }
            return `[${content}](${$node.attr('href')})`;
        },
    },
    color: {
        filter: 'span',
        replacement: function(content, node) {
            const $node = $(node.outerHTML);
            if ($node.hasClass('bbc_color') || $node.hasClass('bbc_size')) {
                if (content.match(/<span/)) {
                    return content.replace(/(<span.+style=")(.+)(".+<\/span>)/, function(match, p1, p2, p3) {
                        return p1 + p2 + $node.attr('style') + p3;
                    })
                }
                return `<span style="${$node.attr('style')}">` + content + '</span>';
            }
            return content;
        }
    },
    sup: {
        filter: 'sup',
        replacement: function(content, node) {
            return `<sup>${content}</sup>`
        }
    },
}

const trowRules = {
    username: {
        filter: 'a',
        replacement: function(content, node) {
            const $node = $(node.outerHTML)
            if ($node.attr('href').match(/showuser/)) {
                return '###### ' + `[${content}](${$node.attr('href')})`;              
            }
            return `[${content}](${$node.attr('href')})`;
        },
    },
}

const rules = {
    [TYPE.S1]: s1Rules,
    [TYPE.APPLE]: appleRules,
    [TYPE.TROW]: trowRules,
}

module.exports = rules;