const {DataMapper} = require('@aws/dynamodb-data-mapper');
const {objectToClass} = require('@liaison/common-utils');
const _ = require('underscore');
const util = require('util');
const {CreateDynamoClient} = require('./dyanmoClient');
const {mustNotExist, mustExist} = require('./dynamoConditions');

// @TODO - Centralized Structured Logger w/ pino as backbone

const ReadConsistency = {
    STRONG: 'strong',
    EVENTUAL: 'eventual'
}

function CreateDataRepository(args = {}) {
    const mapper = args.mapper || new DataMapper({
        client: CreateDynamoClient(),
        readConsistency: ReadConsistency.STRONG,
        skipVersionCheck: false
    });
    const repo = {mapper};
    Object.setPrototypeOf(repo, DataRepository);
    return repo;
}

const DataRepository = {
    async create(item, options) {
        const defaultOptions = {
            skipVersionCheck: true,
            condition: mustNotExist(item)
        };

        const result = await this.mapper.put(item, _.extend(defaultOptions, options));
        console.log(`DataRepository#create ${util.inspect({
            input: item,
            output: result
        })}`);

        return result;
    },
    async delete(item, options) {
        const defaultOptions = {
            returnValues: 'NONE'
        };

        const result = await this.mapper.delete(item, _.extend(defaultOptions, options));

        console.log(`DataRepository#delete ${util.inspect({
            input: item,
            output: result
        })}`);

        return result;
    },
    async update(item, options) {
        const defaultOptions = {
            condition: mustExist(item)
        };

        const result = await this.mapper.put(item, _.extend(defaultOptions, options));

        console.log(`DataRepository#update ${util.inspect({
            input: item,
            output: result
        })}`);

        return result;
    },
    async read(item, options) {
        const defaultOptions = {};

        const result = await this.mapper.get(item, _.extend(defaultOptions, options));

        console.log(`DataRepository#read ${util.inspect({
            input: item,
            output: result
        })}`);

        return result;
    },
    async query(item, options) {
        const defaultOptions = {
            readConsistency: ReadConsistency.EVENTUAL
        };

        const Item = objectToClass(item);

        const items = [];
        for await (const record of this.mapper.query(Item, item, _.extend(defaultOptions, options))) {
            items.push(record);
        }

        console.log(`DataRepository#query ${util.inspect({
            input: item,
            output: items
        })}`);

        return items;
    }
};

Object.freeze(DataRepository);

module.exports = {
    CreateDataRepository,
    DataRepository
};