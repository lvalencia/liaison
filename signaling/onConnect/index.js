const {
    CreateDataRepository,
    Entities: {
        SignalingUser
    }
} = require('@liaison/common-dynamo-data-repository');

exports.handler =  async function(event, context) {
    context.callbackWaitsForEmptyEventLoop = false;

    const dataRepo = CreateDataRepository();

    const {
        requestContext: {
            connectionId
        }
    } = event;

    const user = {connectionId};
    Object.setPrototypeOf(user, SignalingUser);

    await dataRepo.create(user);

    return { statusCode: 201, body: `User ${user.connectionId} Created` };
};