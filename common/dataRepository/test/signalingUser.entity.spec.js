const {assert} = require('chai');
const {SignalingUser} = require('@src/signalingUser.entity');

describe('SignalingUser', () => {
    describe('Object#create', () => {
        it('can create a SignalingUser object', () => {
            const connectionId = 'UID';
            let user = Object.create(SignalingUser);
            user = Object.assign(user, {connectionId});
            assert(user, 'was able to create a user');
        });
    });
});