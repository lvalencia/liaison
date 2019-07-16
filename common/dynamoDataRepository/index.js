const {CreateDataRepository, DataRepository} = require('./src/dataRepository');
const {SignalingUser} = require('./src/signalingUser.entity');

module.exports = {
    CreateDataRepository,
    DataRepository,
    Entities: {
        SignalingUser
    }
};