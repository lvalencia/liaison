const {ConnectionResponder} = require('@liaison/common-communication');
const http = require('http-status-codes');

const {
    CreateDataRepository,
    Entities: {
        SignalingUser,
        SignalingUserIndices
    }
} = require('@liaison/common-data-repository');
const {
    PayloadExtractor,
    PayloadValidator
} = require('@liaison/common-utils');

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

    const responder = {
        domainName,
        stage,
    };
    Object.setPrototypeOf(responder, ConnectionResponder);

    const validateAndExtract = {
        event,
        attributes: [
            'channel'
        ]
    };
    try {
        Object.setPrototypeOf(validateAndExtract, PayloadValidator);
        validateAndExtract.validate();
    } catch (e) {
        Object.assign(responder, {
            connection: connectionId,
            data: e
        });
        await responder.respondAsync();

        return {
            statusCode: http.BAD_REQUEST,
            body: e.stack
        }
    }
    Object.setPrototypeOf(validateAndExtract, PayloadExtractor);
    const {
        channel: channelId
    } = validateAndExtract.extract();

    const user = {
        connectionId,
        channelId
    };
    Object.setPrototypeOf(user, SignalingUser);
    await dataRepo.createAsync(user);

    const queryUsers = {
        channelId
    };
    Object.setPrototypeOf(queryUsers, SignalingUser);

    let connections = await dataRepo.queryAsync(queryUsers, {
        indexName: SignalingUserIndices.CHANNEL_ID_CONNECTION_ID_INDEX
    });

    Object.assign(responder, {
        data: {
            action: 'joinChannel',
            user: connectionId,
            channel: channelId,
            message: `${connectionId} has joined the channel ${channelId}`
        }
    });

    // @TODO - Handle the case where you try to join a room you're already in

    await responder.respondAllAsync({
        connections,
        repo: dataRepo,
        entity: SignalingUser
    });

    return {
        statusCode: http.OK,
        body: `Connection ${connectionId} joined Channel ${channelId}`
    };
};