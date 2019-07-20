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
        connectionId: {
            keyType: KeyTypes.HASH,
            type: 'String'
        },
        channelId: {
            type: 'String'
        }
    },
    writable: false,
    configurable: false,
    enumerable: false
});

const CHANNEL_ID_CONNECTION_ID_INDEX = 'channelId-connectionId-index';

module.exports = {
    SignalingUser,
    SignalingUserIndices: {
        CHANNEL_ID_CONNECTION_ID_INDEX
    }
};
