const { AttributeMissingException } = require('@liaison/common-exceptions');

class RespondableAttributeMissingException extends AttributeMissingException {
    constructor(message, args) {
        super(message, args);
        this.action = 'error';
        this.errorMessage = message;
    }
}

module.exports = {
    RespondableAttributeMissingException
};
