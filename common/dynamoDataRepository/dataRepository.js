const { NotImplementedException } = require('@liaison/common-exceptions');

const DataRepository = {
    create() {
        throw new NotImplementedException('DataRepository#create');
    },
    delete() {
        throw new NotImplementedException('DataRepository#delete');
    },
    update() {
        throw new NotImplementedException('DataRepository#update');
    },
    read() {
        throw new NotImplementedException('DataRepository#read');

    }
};

Object.freeze(DataRepository);

module.exports = DataRepository;