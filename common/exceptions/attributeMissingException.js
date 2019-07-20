class AttributeMissingException extends Error {
    constructor(message, args) {
        super(message);
        this.data = args;
        this.errorType = 'AttributeMissingException';
    }
}

module.exports = {
    AttributeMissingException
};