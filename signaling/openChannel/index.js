const {ConnectionResponder} = require('@liaison/common-communication');
const http = require('http-status-codes');
const uuid = require('uuid/v1');

const {
    CreateDataRepository,
    Entities: {
        SignalingUser
    }
} = require('@liaison/common-data-repository');

exports.handler = async function (event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const dataRepo = CreateDataRepository();

    const {
        requestContext: {
            connectionId,
            domainName,
            stage
        }
    } = event;

    const channelId = uuid();

    const user = {
        connectionId,
        channelId
    };
    Object.setPrototypeOf(user, SignalingUser);
    await dataRepo.createAsync(user);

    const responder = {
        domainName,
        stage,
        connection: connectionId,
        data: {
            action: 'openChannel',
            data: {
                channel: channelId
            }
        }
    };
    Object.setPrototypeOf(responder, ConnectionResponder);
    await responder.respondAsync();

    return {
        statusCode: http.CREATED,
        body: `Channel ${channelId} Created`
    };
};