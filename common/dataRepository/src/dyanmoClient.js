const {NotImplementedException} = require('@liaison/common-exceptions');
const {ClientTypes, DynamoClient, DaxClient} = require('./databaseClient');

function CreateDynamoClient(args = {}) {
    const clientType = args.clientType || ClientTypes.NOT_CACHED;
    let client;
    switch (clientType) {
        case ClientTypes.CACHED:
            client = Object.create(DaxClient);
            break;
        case ClientTypes.NOT_CACHED:
            client = Object.create(DynamoClient);
            break;
        default:
            throw new NotImplementedException('Undefined DB Client: clientType has unknown value', {clientType});

    }
    return client.create();
}

module.exports = {CreateDynamoClient};

