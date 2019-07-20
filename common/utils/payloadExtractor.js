const _ = require('underscore');

const PayloadExtractor = {
    extract() {
        const body = JSON.parse(this.event.body);
        return _.pick(body, this.attributes);
    }
};

Object.freeze(PayloadExtractor);

module.exports = {
    PayloadExtractor
};