class NotImplementedException extends Error {
    constructor(message, args) {
        super(message);
        this.message;
        this.clientType = args.clientType
    }
}

module.exports = {
    NotImplementedException
};