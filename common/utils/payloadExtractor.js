const _ = require('underscore');

const PayloadExtractor = {
    extract() {
        const body = this.extractRawPayload();
        return _.pick(body, this.attributes);
    },
    extractRawPayload() {
        return JSON.parse(this.event.body);
    }
};

Object.freeze(PayloadExtractor);

module.exports = {
    PayloadExtractor
};