const rules = {
    username: {
        filter: 'a',
        replacement: function(content, node) {
            return '<i style="color=#999">' + content + '</i>'
        },
    }
};

module.exports = rules