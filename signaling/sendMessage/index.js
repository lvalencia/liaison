const http = require('http-status-codes');
const {
    CreateDataRepository,
    Entities: {
        SignalingUser,
        SignalingUserIndices
    }
} = require('@liaison/common-data-repository');
const {ConnectionResponder} = require('@liaison/common-communication');
const {RespondableAttributeMissingException} = require('./exceptions');

function validateAndExtractPayload(event) {
    const body = JSON.parse(event.body);
    if (!body.hasOwnProperty('data')) {
        throw new RespondableAttributeMissingException("Message payload is missing attribute 'data'", body);
    }
    const {data} = body;

    if (!body.hasOwnProperty('channel')) {
        throw new RespondableAttributeMissingException("Message does not specify a channel to send messages to", data);
    }
    const {channel} = body;

    return {
        data,
        channel
    };
}

exports.handler = async function (event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

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


    let payload;
    try {
        payload = validateAndExtractPayload(event);
    } catch (e) {
        Object.assign(responder, {
            connection: connectionId,
            data: e
        });
        await responder.respond();

        return {
            statusCode: http.BAD_REQUEST,
            body: e.stack
        }
    }
    Object.assign(responder, {
        data: payload.data
    });

    const dataRepo = CreateDataRepository();

    const user = {
        channelId: payload.channel
    };
    Object.setPrototypeOf(user, SignalingUser);

    let connections = await dataRepo.query(user, {
        indexName: SignalingUserIndices.CHANNEL_ID_CONNECTION_ID_INDEX
    });

    await connections.forEach(async (user) => {
        const {connectionId} = user;
        Object.assign(responder, {
            connection: connectionId
        });
        try {
            await responder.respond();
        } catch (e) {
            if (e.statusCode === http.GONE) {
                console.log(`Found stale connection, deleting ${connectionId}`);

                const userToDelete = {
                    connectionId
                };
                Object.setPrototypeOf(userToDelete, SignalingUser);

                await dataRepo.delete(userToDelete);
            } else {
                throw(e);
            }
        }
    });

    return {
        statusCode: http.OK,
        body: 'Message sent.'
    };
};