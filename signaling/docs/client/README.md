# JavaScript Web Client

You can download the client [here](http://liaison-client.shootthebit.com.s3-website-us-east-1.amazonaws.com/liaison.js)

| Object: Liaison        |
| ---------------------- |
| Delegates To: Object   | 
| Defined in: liaison.js |

## Overview

The Liaison object simplifies creating and managing a mesh network of WebRTC P2P connections over the web. It
is implemented in Native JavaScript, and manages N-many connections for you through the client.
It minimizes the number of calls to the service to establish a connection and provides callback hooks
to focus on your own business logic.

## Method Summary

[connect(callback) => Liaison](#connect-method-details)

Establishes a connection to the Signaling communication back-channel and returns the liaison object.

[onOpenChannel(callback) => Liaison](#onopenchannel-method-details)

Registers a callback hook for the openChannel event and returns the liaison object.

[openChannel() => Liaison](#openchannel-method-details)

Creates a communication channel that will be used to send messages and returns the liaison object.

[onJoinChannel(callback) => Liaison](#onjoinchannel-method-details)

Registers a callback hook for the joinChannel event and returns the liaison object.

[joinChannel(channel) => Liaison](#joinchannel-method-details)

Adds the client to the specified channel.

[onError(callback) => Liaison](#onerror-method-details)

Registers a callback hook for errors sent back from the Signaling services.

[onMessage(callback) => Liaison](#onmessage-method-details)

Registers a callback for when a message is sent through the WebRTC layer.

[sendMessage(message) => Liaison](#sendmessage-method-details)

Sends a message to all peers in the clients WebRTC mesh.

[on(eventName, callback) => Liaison](#on-method-details)

Register a callback hook for a custom event or replaces an older callback.

[off(eventName) => Liaison](#off-method-details)

De-register a callback hook for a custom event.

[_send({action, data, channel, meta}) => void](#send-method-details)

Sends a message directly through the Signaling communication back-channel.

## Constructor Details

The Liaison object is a vanilla JavaScript object - it is not an not an object constructor - so 
you can simply delegate to it via prototypical inheritance. That means the object can be used 
in one of two ways.

You can create a prototypically linked object:

```javascript
let liaison = Object.create(Liaison);
```

or set it as the prototype of an already existing object:

```javascript
Object.setPrototypeOf(liaison, Liaison);
```

::: danger Misuse
Attempts to use the keyword `new` will result in a `TypeError`.

```javascript
$ let liaison = new Liaison();
> TypeError: Liaison is not a constructor
```

The `Liaison` object is immutable and therefore it is not recommended to use it directly. 
Attempts to do so will result in unexpected behavior.
:::

## `connect` Method Details

`connect(callback) => Liaison`

Establishes a connection to the Signaling communication back-channel and returns the liaison object.

**Service Reference**
* [Signaling](/apis)

### Examples

```javascript
liaison.connect((event) => {
    console.log('Connected to Signaling Services');
    console.log(event);
});
```

### Arguments

**Callback**

`function(event) { ... }`

Called when the client successfully connects to the server.

* **Context**:
    * `WebSocket` - the `this` context inside the function refers to the `WebSocket` connection used for establishing communication to our Signaling services.
* **Arguments**
    * event (`Event`) - the open event returned by the `WebSocket` connection.
    
### Returns

* `Liaison` - the liaison callee object.

## `onOpenChannel` Method Details

`onOpenChannel(callback) => Liaison`

Registers a callback hook for the openChannel event and returns the liaison object.

**Service Reference**
* [openChannel](apis/#openchannel)

### Examples

```javascript
liaison.onOpenChannel((message) => {
    console.log('Received openChannel message');
    console.log(message);
});
```

### Arguments

**Callback**

`function (message) { ... }`

Called when the channel has been successfully opened.

* **Context**:
    * the `this` context inside the function will be the [binding rule](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md) that applies to your function.
* **Arguments**
    * message - the response from the services invocation of `openChannel`. The message object has the following properties:
        * meta (`Object`) - a metadata object containing information about the message itself.
            * sender (`String`) - the id of the invoking client connection.
        * channel (`String`) - the id of the newly opened channel.

### Returns

* `Liaison` - the liaison callee object.

## `openChannel` Method Details

`openChannel() => Liaison`

Creates a communication channel that will be used to send messages and returns the liaison object.

**Service Reference**
* [openChannel](/apis/#openchannel)

### Examples

```javascript
liaison.openChannel();
```

### Arguments

None

### Returns

* `Liaison` - the liaison callee object.

## `onJoinChannel` Method Details

`onJoinChannel(callback) => Liaison`

Registers a callback hook for the joinChannel event and returns the liaison object. When the callback is
invoked the client will begin establishing direct P2P connections between all clients on the channel. 

**Service Reference**
* [joinChannel](/apis/#joinchannel)

### Examples

```javascript
liaison.onJoinChannel((message) => {
    const {user, channel} = message;
    console.log(`${user} joined ${channel}`);
});
```

### Arguments

**Callback**

`function (message) { ... }`

Called when the client has successfully joined the channel.

* **Context**:
    * the `this` context inside the function will be the [binding rule](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md) that applies to your function.
* **Arguments**
    * message - the response from the services invocation of `openChannel`. The message object has the following properties
        * channel (`String`) - id of the channel that was joined.
        * users (`String`) - the id of the user that has joined the channel.
        * members (`Array[String]`) - ids of the members of that channel, this includes the user client.

### Returns

* `Liaison` - the liaison callee object.

## `joinChannel` Method Details

`joinChannel(channel) => Liaison`

Adds the client to the specified channel for the purposes of establishing P2P connections between 
the clients in the channel. It also returns the liaison object.

**Service Reference**
* [joinChannel](/apis/#joinchannel)

### Examples

```javascript
let channelId = '1a33ae30-c244-11e9-882d-51b4c4b0c142';
liaison.joinChannel(channelId);
```

### Arguments

**Parameters**
* **channel** - id of the channel that the client is joining.
    
### Returns

* `Liaison` - the liaison callee object.

## `onError` Method Details

`onError(callback) => Liaison`

Registers a callback hook for when the Liaison services send an error message.

**Service Reference**
* [Signaling](/apis)

### Examples 

```javascript
liaison.onError((error) => {
     let {
        errorType,
        errorMessage,
        payload
     } = error;
    console.log(`Received Error: ${errorType} - ${errorMessage} (Original Payload):`);
    console.log(payload);
});
```

### Arguments

**Callback**

`function (error) { ... }`

Called when the Signaling services send an error message to the client.

* **Context**:
    * the `this` context inside the function will be the [binding rule](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md) that applies to your function.
* **Arguments**
    * error - the error message from the service. The error object has the following properties:
        * errorType (`String`) - the type of error that was encountered.
        * errorMessage (`String`) - the details of the error that was encountered.
        * payload (`Object`) - the original message sent to the services that caused the error to occur.
        
### Returns

* `Liaison` - the liaison callee object.

## `onMessage` Method Details

`onMessage(callback) => Liaison`

Registers a callback for when a message is sent through the WebRTC layer.

**Service Reference**
* [sendMessage](/apis/#sendmessage)

### Examples

```javascript
liaison.onMessage((message) => {
    console.log(`Received a message ${message.data} from ${message.currentTarget.label}`);
});
```

### Arguments

**Callback**

`function (message) { ... }`

Called when the client receives a message from a WebRTC peer.

* **Context**
    * `RTCDataChannel` - the `this` context inside the function refers to the `RTCDataChannel` that was used to transport the message.
* **Arguments**
    * message (`MessageEvent`) - the `RTCDataChannel` message sent by the peer. The message interface can be [found here](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent)
    
### Returns

* `Liaison` - the liaison callee object.

## `sendMessage` Method Details

`sendMessage(message) => Liaison`

Sends a message to all peers in the clients WebRTC mesh.

**Service Reference**
* [sendMessage](/apis/#sendmessage)

### Examples

```javascript
const message = {
    hello: 'liaison'
};
liaison.sendMessage(message);
```

### Arguments

**Parameters**
* **message** (`any`) - the message to send over the WebRTC layer to all peers in the mesh

### Returns

* `Liaison` - the liaison callee object.

## `on` Method Details

`on(eventName, callback) => Liaison`

Register a callback hook for a custom event or replaces an older callback.

**Service Reference**
* [sendMessage](/apis/#sendmessage)

### Examples

```javascript
liaison.on('my-super-awesome-action', (message) => {
    console.log(`My custom action sent this data: ${message}`);
});
```

### Arguments

**Parameters**
* **eventName** (`String`) - the name of the action for the custom structured message you want to register a callback on.

**Callback**

`function (message) { ... }`

Called when the client receives the message with the eventName action from the Signaling communication back-channel.

* **Context**:
    * the `this` context inside the function will be the [binding rule](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md) that applies to your function.
* **Arguments**
    * message (`Object`) - the custom structured message sent through the communication back-channel.
    
### Returns

* `Liaison` - the liaison callee object.

## `off` Method Details

`off(eventName) => Liaison`

De-register a callback hook for a custom event.

**Service Reference**
* [sendMessage](/apis/#sendmessage)


### Examples

```javascript
liaison.off('my-super-awesome-action')
```

### Arguments

**Parameters**
* **eventName** (`String`) - the name of the action for the custom structured message you want to de-register. 

### Returns

* `Liaison` - the liaison callee object.

## `_send` Method Details

`_send({action, data, channel, meta}) => void`

Sends a message directly through the Signaling communication back-channel.

**Service Reference**
* [sendMessage](/apis/#sendmessage)

### Examples

```javascript
liaison._send({
    action: 'sendMessage',
    channel: '9ecd9200-c316-11e9-8691-e305efd6bacb',
    data: {
        action: 'my-super-awesome-action',
        data: {
            hello: 'custom world'
        }
    }
});
```

### Arguments

**Parameters**
* data (`Object`) - The data object has the following properties:
    * action (`String`) - this value should be `sendMessage`.
    * channel (`String`) - the channel to send the message to.
    * meta (`Object`) - an optional metadata object containing information about the message itself. If provided will pass-through the meta object, if a recipient is provided it will narrow the message to that client. The meta object has the following properties:
        * sender (`String`) - the id of the invoking client connection.
        * recipient(`String`) - the id of the client intended to receive the message.
    * data (`Object`) - the custom structured message to relay through the communication back-channel. The data object has the following properties:
        * action (`String`) - the `eventName` of your custom message
        * data (`any`) - the message you data you intend to send.
        
### Returns

* `void`
