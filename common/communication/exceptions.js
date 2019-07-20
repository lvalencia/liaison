class ResponderProtocolException extends Error {
    constructor(message, args) {
        super(message);
        this.responder = args;
        this.errorType = 'ResponderProtocolException';
    }
}

module.exports = {
    ResponderProtocolException
};