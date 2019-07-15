function NotImplementedException(message) {
    this.message = (message || "");
}

Object.setPrototypeOf(NotImplementedException, Error);

module.exports = NotImplementedException;