/*
 * @TODO - Add Filter Expression for excluding TTL items
 */
const {getSchema} = require('@aws/dynamodb-data-mapper');
const {AttributePath, FunctionExpression} = require('@aws/dynamodb-expressions');
const _ = require('underscore');
const { KeyMissingException } = require('./exceptions');

const KeyTypes = {
    HASH: 'HASH',
    RANGE: 'RANGE'
};

const Expression = {
    ATTRIBUTE_NOT_EXISTS: 'attribute_not_exists',
    ATTRIBUTE_EXISTS: 'attribute_exists'
};

function getKeyNames(item) {
    const dbSchema = getSchema(item);

    let hashKeyName;
    let rangeKeyName;

    for (let propName in dbSchema) {
        // Guard against traversing up the prototype delegation chain
        if (dbSchema.hasOwnProperty(propName)){
            const property = dbSchema[propName];
            switch (property.keyType) {
                case KeyTypes.HASH:
                    hashKeyName = propName;
                    break;
                case KeyTypes.RANGE:
                    rangeKeyName = propName;
                    break;
                default:
                    break;
            }
        }
        // Short-Circuit
        if (hashKeyName && rangeKeyName) {
            break;
        }
    }

    if (_.isEmpty(hashKeyName)) {
        throw new KeyMissingException('DB Schema for item does not include a HASH key', {
            item,
            dbSchema
        });
    }

    return {
        hashKeyName,
        rangeKeyName
    }
}

function existanceExpression({item, expression}) {
    const {hashKeyName} = getKeyNames(item);
    return new FunctionExpression(
        expression,
        new AttributePath(hashKeyName)
    );
}

function mustNotExist(item) {
    return existanceExpression({
        item,
        expression: Expression.ATTRIBUTE_NOT_EXISTS
    });
}

function mustExist(item) {
    return existanceExpression({
        item,
        expression: Expression.ATTRIBUTE_EXISTS
    });
}

module.exports = {
    mustNotExist,
    mustExist
};

