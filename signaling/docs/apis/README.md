# API's

## Signaling

The Liaison Signaling API's are consumed through WebSockets. You can make action requests by sending structured messages 
to the following endpoint. `wss://5qucnj0ap2.execute-api.us-east-1.amazonaws.com/alpha`, for example:

```javascript
let connection = new WebSocket('wss://5qucnj0ap2.execute-api.us-east-1.amazonaws.com/alpha');
```

For the time being it isn't necessary to specify a protocol when creating the Websocket Connection.

However the structured messages being sent are expected to be to be well formed JSON with the following schema:

```json
{
    "$id": "https://example.com/person.schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Message",
    "type": "object",
    "properties": {
        "action": {
            "type": "string",
            "description": "The action to route to in the API: openChannel | joinChannel | sendMessage"
        },
        "meta": {
            "type": "object",
            "description": "Metadata related to the request being sent",
            "properties": {
                "sender": {
                    "type": "string",
                    "description": "The id of the creator of the message. If present message will forward the sender in message."
                },
                "recipient": {
                    "type": "string",
                    "description": "The id of the intended recipient of the message. If present message will only send the message to the recipient."
                }
            }
        },
        "channel": {
            "type": "string",
            "description": "The channel id."
        },
        "data": {
            "type": "object",
            "description": "Arbitrary message to be sent from point to point."
        }
    }
}
```

Practically speaking that means your messages should look something like this:

```json
{
    "action": "api-action",
    "meta": {
        "sender": "senderId",
        "receiver": "receiverId"
    },
    "channel": "channelId",
    "data": {
        "message": "specific to action"
    }
}
```

The API supports the below actions.

### openChannel

The `openChannel` action returns a message to the requester with newly created channel. The response payload looks like the following:

```json
{
    "action": "openChannel",
    "meta": {
        "sender": "senderId"
    },
    "channel": "channelId"
}
```

The `action` has the value `openChannel` to indicate which action of the API that was invoked, the `sender` in the `meta` 
object is the id of initiator of the action, and the `channel` is the channel id for the newly created channel.

The created channel has a Time-To-Live (TTL) of five minutes, after which the API makes no guarantees on the availability
of the channel if invoked with `joinChannel` or `sendMessage`

In order to properly invoke this action, the websocket endpoint expects the following message:

```json
{
    "action": "openChannel"
}
```

::: tip API Proposal
We are considering a change to the API to allow a configurable TTL with a sane upper-bound.
In that situation, the message would look like the following:

```json
{
    "action": "openChannel",
    "data": {
        "ttl": 300
    }
}
```

In this scenario the TTL would be in seconds.

If you'd like to see this change or want to provide input into the API's send us an email at <a href="mailto:liaison.alpha.feedback+apis@gmail.com">liaison.alpha.feedback+apis@gmail.com</a>
:::

### joinChannel

The `joinChannel` action returns a message to everyone in the channel with the added user and the current members of a channel.

**Note**: This is done after adding the user to the channel so that user will be included in the recipients of the message.

The response payload looks like the following:

```json
{

    "action": "joinChannel",
    "meta": {
        "sender": "senderId"
    },
    "data": {
        "user": "userId",
        "channel": "channelId",
        "members": [
            "userId1",
            "userId2",
            "userIdN"
        ]
    }
}
```

The `action` has the value `joinChannel` to indicate which action of the API that was invoked and the `sender` in the `meta` 
object is the id of initiator of the action. In the `data` object there's the following properties:  

* `user` - a unique identifier for the user that was added.
* `channel` - the channel id for the channel to which the user was added.
* `members` - an array of unique identifiers for the users that are currently in the channel

In order to properly invoke this action, the websocket endpoint expects the following message:

```json
{
    "action": "joinChannel",
    "channel": "channelId"
}
```

::: warning Malformed Requests
If the request is malformed the action will return a message with the following structure

```json
{
    "action": "error",
    "errorType": "AttributeMissingException",
    "errorMessage": "Message does not specify [attribute] in body:",
    "data": {
        "action": "joinChannel",
        ... the rest of the original message sent ...
    }
}
```

where `[attribute]` would be the missing attribute (in this case you'd see `channel`) and `data` contains the 
original message sent to the action.
:::

::: danger Indeterminate Behavior
The following cases have not been accounted for and will result in indeterminate behavior

* Case where you try to join a channel you're already in
* Case where you try to join a channel that doesnt exist
 
please avoid these cases in your implementations during the alpha phase
:::

### sendMessage

The `sendMessage` action returns a message to either everyone in the channel that has been specified in the request. The
only time this is not the case is when `recipient` or `sender` are specified in the request. If `recipient` is specified 
then it only sends that message to that recipient. If the `sender` is specified in the request , the message is sent to 
everyone except the sender. The rules are applied by most restrictive messaging, meaning that if you specify both, it will 
only send it to the intended recipient, however **both attributes are forwarded in the corresponding message**.

The response payload looks like the following:

```json
{
    "action": "sendMessage",
    "meta": {
        "sender": "senderId",
        "recipient": "recipientId"
    },
    "data": {
        ... the message sent ...
    }
}
```

The `action` has the value `sendMessage` to indicate which action of the API that was invoked. 

The `sender` and `recipient` in the `meta` object corresponds to the `sender` and `recipient` of the `meta` object in the
request. The `data` object is also the `data` object from the request.

In order to properly invoke this action, the websocket endpoint expects the following message:

```json
{
    "action": "sendMessage",
    "channel": "channelId",
    "data": {
        "message": "that you'd like to send to other members of the channel"
    }
}
```
::: warning Malformed Requests
If the request is malformed the action will return a message with the following structure

```json
{
    "action": "error",
    "errorType": "AttributeMissingException",
    "errorMessage": "Message does not specify [attribute] in body:",
    "data": {
        "action": "sendMessage",
        ... the rest of the original message sent ...
    }
}
```

where `[attribute]` would be the missing attribute (in this case it could be `channel` or `data`) and `data` contains the 
original message sent to the action.
:::

::: danger Communication Channel
While you can use the `sendMessage` action to send messages of your own liking between one or more parties in a room,
the intention of the Signaling services is that you use this tunnel to exchange information necessary in a handshake to
establish a direct P2P connection as you would in WebRTC. 

Using it as a tunnel will incur charges associated with its usage.
:::

## See Also

For more information about using this API in an SDK, see the following:

* [Liaison JavaScript Web Client Library](/client)