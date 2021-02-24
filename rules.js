const rules = {
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

module.exports = rules