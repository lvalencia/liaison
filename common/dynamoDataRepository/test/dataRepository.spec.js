const {stub, assert: sinonAssert, match} = require('sinon');

const {
    CreateDataRepository
} = require('@src/dataRepository');

describe('DataRepository', () => {
    let mockMapper = {
        put: () => {},
        delete: () => {},
        get: () => {},
        query: () => {}
    };

    let queryStub;

    beforeEach(() => {
        queryStub = stub(mockMapper, 'query').returns([]);
    });
    describe('CreateDataRepository', () => {
        it('creates an object that delegates query to DataRepository', async () => {
            const repo = CreateDataRepository({
                mapper: mockMapper
            });
            const item = {};
            const options = {};
            await repo.query(item, options);

            sinonAssert.calledOnce(queryStub);
            sinonAssert.calledWith(queryStub, match.any, item, {readConsistency: 'eventual'});
        });
    });
});