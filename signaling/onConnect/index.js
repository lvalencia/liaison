const {
    CreateDataRepository,
    Entities: {
        SignalingUser
    }
} = require('@liaison/common-data-repository');
const http = require('http-status-codes');

exports.handler =  async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const dataRepo = CreateDataRepository();

    const {
        requestContext: {
            connectionId
        }
    } = event;

    const user = {
        connectionId,
        channelId: connectionId
    };
    Object.setPrototypeOf(user, SignalingUser);
    await dataRepo.create(user);

    return {
        statusCode: http.CREATED,
        body: `User ${user.connectionId} Created`
    };
};