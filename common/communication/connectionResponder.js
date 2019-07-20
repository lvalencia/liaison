const {ApiGatewayManagementApi} = require('aws-sdk');
const http = require('http-status-codes');
const _ = require('underscore');
const util = require('util');
const {AttributeMissingException} = require('@liaison/common-exceptions');
const {ResponderProtocolException} = require('./exceptions');

const ConnectionResponder = {
    get connectionResponder() {
        this.responder = this.responder || new ApiGatewayManagementApi({
            endpoint: `${this.domainName}/${this.stage}`
        });
        return this.responder;
    },
    get responderConformsToProtocol() {
        return !_.isEmpty(this.responder) && ('postToConnection' in this.responder);
    },
    validateCanSend() {
        const requiredAttributes = [
            'data',
            'connection'
        ];

        if (!this.hasOwnProperty('responder')) {
            requiredAttributes.concat([
                'domainName',
                'stage',
            ])
        }

        if (this.hasOwnProperty('responder') && !this.responderConformsToProtocol) {
            throw new ResponderProtocolException('Responder does not conform to protocol, missing method: `postToConnection`', this.responder);
        }

        requiredAttributes.forEach((attribute) => {
            if (!this.hasOwnProperty(attribute) || _.isEmpty(this[attribute])) {
                throw new AttributeMissingException(`Object does not specify attribute ${attribute}`, this);
            }
        });
    },
    async respondAsync() {
        this.validateCanSend();

        const data = JSON.stringify(this.data);

        console.log(`ConnectionResponder#respond sending data to ${this.connection}: ${data}`);
        const request = this.connectionResponder.postToConnection({
            ConnectionId: this.connection,
            Data: data
        });

        if ('then' in request) {
            await request;
        } else if ('promise' in request) {
            await request.promise();
        } else {
            throw new ResponderProtocolException('Responder#postToConnection result is not a promise, nor does it provide a method `promise`', this);
        }
    },
    async respondAllAsync({connections, repo, entity}) {
        console.log(`ConnectionResponder#respondAllAsync responding to ${util.inspect(connections)}`);

        const responses = connections.map(async (connection) => {
            const {connectionId, channelId} = connection;
            Object.assign(this, {
                connection: connectionId
            });
            try {
                await this.respondAsync();
            } catch (e) {
                if (e.statusCode === http.GONE) {
                    console.log(`ConnectionResponder#respondAllAsync found stale connection ${connectionId}`);

                    if (!_.isEmpty(repo)) {
                        console.log(`ConnectionResponder#respondAllAsync deleting connection ${connectionId}`);

                        // @TODO - Make creation of this object generic, so it's independent of key changes
                        //         i.e. use getKeyNames to construct object

                        const connectionToDelete = {
                            connectionId,
                            channelId
                        };
                        Object.setPrototypeOf(connectionToDelete, entity);

                        await repo.deleteAsync(connectionToDelete);
                    }
                } else {
                    throw(e);
                }
            }
        });

        if (!_.isEmpty(responses)) {
            console.log(`ConnectionResponder#respondAllAsync awaiting all responses ${util.inspect(responses)}`);
            await Promise.all(responses);
        }
    }
};

Object.freeze(ConnectionResponder);

module.exports = {
    ConnectionResponder
};