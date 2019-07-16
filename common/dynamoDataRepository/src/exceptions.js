class KeyMissingException extends Error {
    constructor(message, args) {
        super(message);
        this.item = args.item;
        this.dbSchema = args.dbSchema;
        this.errorType = 'KeyMissingException';
    }
}

module.exports = {
    KeyMissingException
};
