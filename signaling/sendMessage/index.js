// @TODO - Clean up this code, it's dogshit
const {
    CreateDataRepository,
    Entities: {
        SignalingUser,
        SignalingUserIndices
    }
} = require('@liaison/common-dynamo-data-repository');
const {ApiGatewayManagementApi} = require('aws-sdk');
const http = require('http-status-codes');
const util = require('util');
const {
    NoChannelSpecifiedException,
    NoDataAttributeInMessageException
} = require('./exceptions');

function validateAndExtractPayload(event) {
    const body = JSON.parse(event.body);
    if (!body.hasOwnProperty('data')) {
        throw new NoDataAttributeInMessageException("Message payload is missing attribute 'data'", body);
    }
    const {data} = body;

    if (!body.hasOwnProperty('channel')) {
        throw new NoChannelSpecifiedException("Message does not specify a channel to send messages to", data);
    }
    const {channel} = body;

    return {
        data,
        channel
    };
}

async function respondTo({responder, connection, data}) {
    console.log(`index#respondTo sending data to ${connection}: ${data}`);
    await responder.postToConnection({
        ConnectionId: connection,
        Data: data
    }).promise();
}

exports.handler = async function (event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const {
        requestContext: {
            domainName,
            stage,
            connectionId
        }
    } = event;

    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint: `${domainName}/${stage}`
    });

    let channel, data;
    try {
        const payload = validateAndExtractPayload(event);
        channel = payload.channel;
        data = payload.data;
    } catch (e) {
        await respondTo({
            responder: apigwManagementApi,
            connection: connectionId,
            data: JSON.stringify(e)
        });

        return {
            statusCode: http.BAD_REQUEST,
            body: e.stack
        }
    }

    const dataRepo = CreateDataRepository();
    const user = {
        channelId: channel
    };
    Object.setPrototypeOf(user, SignalingUser);

    let connections = await dataRepo.query(user, {
        indexName: SignalingUserIndices.CHANNEL_ID_CONNECTION_ID_INDEX
    });

    await connections.forEach(async (user) => {
        const {connectionId} = user;
        try {
            await respondTo({
                responder: apigwManagementApi,
                connection: connectionId,
                data: JSON.stringify(data)
            });
        } catch (e) {
            if (e.statusCode === http.GONE) {
                console.log(`Found stale connection, deleting ${connectionId}`);

                const userToDelete = Object.assign(
                    Object.create(SignalingUser),
                    {connectionId}
                );

                await dataRepo.delete(userToDelete);
            } else {
                console.log(util.inspect(e));
                return {
                    statusCode: http.INTERNAL_SERVER_ERROR,
                    body: e.stack
                }
            }
        }
    });

    return {
        statusCode: http.OK,
        body: 'Message sent.'
    };
};