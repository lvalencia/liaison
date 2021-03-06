const http = require('http-status-codes');
const _ = require('underscore');
const {
    CreateDataRepository,
    Entities: {
        SignalingUser
    }
} = require('@liaison/common-data-repository');
const {ConnectionResponder} = require('@liaison/common-communication');

const {
    PayloadExtractor,
    PayloadValidator
} = require('@liaison/common-utils');

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

    const validateAndExtract = {
        event,
        attributes: [
            'channel',
            'data',
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
    const {data, channel} = validateAndExtract.extract();

    const dataRepo = CreateDataRepository();

    const queryUsers = {
        channelId: channel
    };
    Object.setPrototypeOf(queryUsers, SignalingUser);

    let connections = await dataRepo.queryAsync(queryUsers);

    const meta = {
        sender: connectionId,
    };

    const rawPayload = validateAndExtract.extractRawPayload();
    if (rawPayload.hasOwnProperty('meta')) {
        const {
            meta: {
                recipient,
                sender
            }
        } = rawPayload;

        _.extend(meta,  _.pick({recipient, sender}, _.identity));

        connections = _.filter(connections, ({connectionId}) => {
            let bool = true;
            if (recipient) {
                bool = bool && (connectionId === recipient);
            }
            if (sender) {
                bool = bool && (connectionId !== sender);
            }
            return bool;
        });
    }
    _.extend(data, {meta});

    Object.assign(responder, {data});

    await responder.respondAllAsync({connections});

    return {
        statusCode: http.OK,
        body: 'Message sent.'
    };
};