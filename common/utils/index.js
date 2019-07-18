// Classes don't exist in JavaScript, this is what you're doing to Objects when you use a class
function objectToClass(obj) {
    function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }
    function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    let ValueConstructor = function ValueConstructor() {
        _classCallCheck(this, ValueConstructor);
        Object.assign(this, obj);
        const prototype = Object.getPrototypeOf(obj);
        Object.setPrototypeOf(this, prototype);
        Object.getOwnPropertySymbols(prototype).forEach((symbol) => {
            this[symbol] = prototype[symbol];
        });
    };
    ValueConstructor.prototype = Object.getPrototypeOf(obj);
    return ValueConstructor;
}

module.exports = {
    objectToClass
};