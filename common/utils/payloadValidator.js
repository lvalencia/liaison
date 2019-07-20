const {RespondableAttributeMissingException} = require('@liaison/common-exceptions');
const util = require('util');

const PayloadValidator = {
    validate() {
        const body = JSON.parse(this.event.body);
        console.log(`PayloadValidator#validate validating ${this.attributes}`);
        this.attributes.forEach((attribute) => {
            console.log(`PayloadValidator#validate validating ${attribute} in ${util.inspect(body)}`);
            if (!body.hasOwnProperty(attribute)) {
                throw new RespondableAttributeMissingException(`Message does not specify '${attribute}' in body:`, body);
            }
        });
    }
};

Object.freeze(PayloadValidator);

module.exports = {
    PayloadValidator
};