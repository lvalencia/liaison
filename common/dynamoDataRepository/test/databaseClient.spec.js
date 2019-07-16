const {stub, assert: sinonAssert} = require('sinon');
const {DynamoClient} = require('@src/databaseClient');

describe('DatabaseClient', () => {
    describe('#create', () => {
        let clientConstructor;
        let client;
        const region = 'fake-region';
        const endpoint = 'fake-endpoint';
        beforeEach(() => {
            clientConstructor = stub().returns({});
            client = {
                _clientConstructor: clientConstructor,
                _region: region,
                _endpoint: endpoint
            };
        });
        it('can create a database client', () => {
            Object.setPrototypeOf(client, DynamoClient);
            client.create();

            sinonAssert.calledOnce(clientConstructor);
            sinonAssert.calledWith(clientConstructor, { region, endpoint });
        });
        it('excludes the endpoint in lambda setting', () => {
            process.env.LAMBDA_TASK_ROOT = 'something';
            process.env.AWS_EXECUTION_ENV  = 'something';

            Object.setPrototypeOf(client, DynamoClient);
            client.create();

            delete process.env.LAMBDA_TASK_ROOT;
            delete process.env.AWS_EXECUTION_ENV;
        });
    });
});