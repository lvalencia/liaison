const {isLambda} = require('./isLambda');
const {objectToClassConstructor} = require('./objectToClassConstructor');
const {PayloadValidator} = require('./payloadValidator');
const {PayloadExtractor} = require('./payloadExtractor');

module.exports = {
    isLambda,
    objectToClassConstructor,
    PayloadExtractor,
    PayloadValidator
};