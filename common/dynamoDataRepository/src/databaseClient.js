const AWS = require('aws-sdk');
const AmazonDaxClient = require('amazon-dax-client');
const { isLambda } = require('@liaison/common-environment');
const _ = require('underscore');

const ClientTypes = {
    CACHED: 'CACHED',
    NOT_CACHED: 'NOT_CACHED'
};

const DynamoClient = {
    get clientConstructor() {
        return this._clientConstructor || AWS.DynamoDB;
    },
    get endpoint() {
        return this._endpoint || process.env.DYNAMO_ENDPOINT;
    },
    get region() {
        return this._region || process.env.DYNAMO_REGION;
    }
};

const DaxClient = {
    get clientConstructor() {
        return this._clientConstructor || AmazonDaxClient;
    },
    get endpoint() {
        return this._endpoint || process.env.DYNAMO_ENDPOINT;
    },
    get region() {
        return this._region || process.env.DYNAMO_REGION;
    }
};

const DatabaseClient = {
    create()  {
        let args = {
            region: this.region
        };

        if (!isLambda()){
            args = _.extend(args, {
                endpoint: this.endpoint
            })
        }

        return new this.clientConstructor(args);
    }
};

Object.freeze(DatabaseClient);

Object.setPrototypeOf(DynamoClient, DatabaseClient);
Object.setPrototypeOf(DaxClient, DatabaseClient);

Object.freeze(DynamoClient);
Object.freeze(DaxClient);

module.exports = {
    DatabaseClient,
    DynamoClient,
    DaxClient,
    ClientTypes
};