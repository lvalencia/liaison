const {ApiGatewayManagementApi} = require('aws-sdk');
const _ = require('underscore');
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
    async respond() {
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
    }
};

Object.freeze(ConnectionResponder);

module.exports = {
    ConnectionResponder
};