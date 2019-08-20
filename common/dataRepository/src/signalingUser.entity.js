const {DynamoDbSchema, DynamoDbTable} = require('@aws/dynamodb-data-mapper');
const {KeyTypes} = require('@aws/dynamodb-data-marshaller');
const SignalingUser = {};

Object.defineProperty(SignalingUser, DynamoDbTable, {
    value: 'LiaisonSignaling',
    writable: false,
    configurable: false,
    enumerable: false
});

Object.defineProperty(SignalingUser, DynamoDbSchema, {
    value: {
        channelId: {
            keyType: KeyTypes.HASH,
            type: 'String'
        },
        connectionId: {
            keyType: KeyTypes.RANGE,
            type: 'String'
        },
        ttl: {
            type: 'Number'
        }
    },
    writable: false,
    configurable: false,
    enumerable: false
});

module.exports = {
    SignalingUser
};
