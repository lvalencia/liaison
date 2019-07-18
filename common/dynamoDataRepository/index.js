const {CreateDataRepository, DataRepository} = require('./src/dataRepository');
const {SignalingUser, SignalingUserIndices} = require('./src/signalingUser.entity');

module.exports = {
    CreateDataRepository,
    DataRepository,
    Entities: {
        SignalingUser,
        SignalingUserIndices
    }
};