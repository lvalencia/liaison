class NoDataAttributeInMessageException extends Error {
    constructor(message, args) {
        super(message);
        this.action = 'error';
        this.payload = args;
        this.errorMessage = message;
        this.errorType = 'NoDataAttributeInMessageException'
    }
}

class NoChannelSpecifiedException extends Error {
    constructor(message, args) {
        super(message);
        this.action = 'error';
        this.data = args;
        this.errorMessage = message;
        this.errorType = 'NoChannelSpecified';
    }
}

module.exports = {
    NoChannelSpecifiedException,
    NoDataAttributeInMessageException
};
