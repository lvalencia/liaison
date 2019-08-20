# Getting Started with Liaison Signaling

This guide covers how to get up and running with liaison signaling

After reading this guide you'll know:

<span style="color: #42b983">✔</span> What WebRTC is<br />
<span style="color: #42b983">✔</span> What Liaison Signaling is<br />
<span style="color: #42b983">✔</span> How to consume the Liaison Signaling service<br />
<span style="color: #42b983">✔</span> What utility the JavaScript Web Client provides<br />
<span style="color: #42b983">✔</span> Where to get the JavaScript Web Client<br />
<span style="color: #42b983">✔</span> How to use the JavaScript Web Client to make a mesh network<br />
<span style="color: #42b983">✔</span> Where you can go to learn more about the services and the client<br />

## Guide Assumptions

This guide is designed for anyone that wants to write a many-to-many P2P component as part of a web application.
It does not assume any familiarity or knowledge with [WebRTC](https://webrtc.org/), but it does assume knowledge of programming. Any code
examples you may see during this guide are written in JavaScript and run on browser. As a result if you're not 
familiar with JavaScript and Web Development you might find you have a steep learning curve. There are several
resources to help you learn JavaScript and Web Development:

* [W3C Schools](https://www.w3schools.com/)
* [JavaScript](https://javascript.info/)

The primary way you'll interact with our services will be through the JavaScript web client; it would be helpful to 
be comfortable with your browsers DevTools.

## What is WebRTC?

WebRTC is an HTML5 specification that you can use to add real time media communications directly between browser and devices.
WebRTC enables serverless peer to peer communication to work inside web pages. It is also what the technology that
the Liaison client uses to enables many to many serverless peer to peer communication.

## What is Liaison Signaling?

It is a solution to the problem presented by WebRTC when creating P2P serverless establishing connections.
The problem is that WebRTC itself does not provide a specification for signaling. However, signaling is a 
necessary process for coordinating communication before you can engage in serverless P2P communication. 
In order for a WebRTC application to set up channel whereby two peers can exchange information directly, its 
clients need to exchange the following information:

* Session control messages used to open or close communication.
* Error messages.
* Media metadata such as codecs and codec settings, bandwidth and media types.
* Key data, used to establish secure connections.
* Network data, such as a host's IP address and port as seen by the outside world.

This signaling process needs a way for clients to pass messages back and forth. That mechanism is not 
implemented by the WebRTC APIs: you need to build it yourself, at least you did until now.

Liaison Signaling is a service with a set of APIs, implemented by the Liaison team, that provides a mechanism
to exchange the above information prior to creating a serverless P2P communication channel.

## Consuming the Liaison Signaling Service

You can either consume the API's directly or using the JavaScript Web Client.
 
::: tip If I can consume the services directly why do I need the Web Client?
The client provides utility beyond the primitives offered by the service including:

* Implementing the handshake logic for P2P communication 
* Minimizing the number of network/services calls necessary for P2P communication
* Creating and managing a mesh network.

This is a great starting point for worrying less about the inner workings of P2P communication and focusing
more on building an application that leverages the technology. However, if for some reason the client doesn't 
fulfill your needs, you can always roll your own.
:::

For the purposes of this getting started doc we're going to use the JavaScript Web Client.

### Where to get the the JavaScript Web Client

You can download the client [here](http://liaison-client.shootthebit.com.s3-website-us-east-1.amazonaws.com/liaison.js) 
or include it as a script in your html page like so

```html
<!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Sample Web Client</title>
      <script src="http://liaison-client.shootthebit.com.s3-website-us-east-1.amazonaws.com/liaison.js"></script>
  </head>
</html>
```

after the `Liaison` object will be globally available for use.

::: warning Possible Latency
The client is loaded from an S3 URL and is not behind a CDN, there might be some latency associated with loading it.
:::

### Using the Web Client

*If you want to look at the parts individually, feel free to [skip the overall code](#using-the-client-object)*

#### The Overall Code

The following is a sample web page written in plain JavaScript that demonstrates the usage of the Liaison Web Client.
The application does the following: it can create channels, it can join channels, and it can send a message to everyone
in a channel. 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Web Client</title>
    <script src="http://liaison-client.shootthebit.com/liaison.js"></script>
    <script type="text/javascript">
        function onDOMContentLoaded() {
            window.liaison = Object.create(Liaison);

            liaison.connect(() => {
                console.log('Connected to Server');
            }).onJoinChannel((message) => {
                const {user, channel} = message;
                let p = document.createElement('p');
                p.innerHTML = `${user} has joined the channel ${channel}`;
                const announcements = document.getElementById('announcements');
                announcements.appendChild(p);
            }).onOpenChannel((message) => {
                const span = document.getElementById('pid');
                span.innerText = message.channel;
            }).onMessage((message) => {
                addMessageToChat(message.currentTarget.label, message.data);
            });

            document.getElementById('create').addEventListener('click', () => {
                liaison.openChannel();
            });
            document.getElementById('join').addEventListener('click', joinChannel);
            document.getElementById('room-id').addEventListener('keyup', (event) => {
                if (event.key === "Enter") {
                    joinChannel();
                }
            });
            document.getElementById('send').addEventListener('click', handleInput);
            document.getElementById('chat-input').addEventListener('keyup', (event) => {
                if (event.key === "Enter") {
                    handleInput();
                }
            });

            function joinChannel() {
                const btn  = document.getElementById('join');
                btn.disabled = true;
                const input = document.getElementById('room-id');
                input.disabled = true;
                const room = input.value;
                liaison.joinChannel(room);
            }

            function handleInput() {
                const input = document.getElementById('chat-input');
                const message = input.value;

                addMessageToChat("Me", message);

                liaison.sendMessage(message);
            }

            function addMessageToChat(label, message) {
                const textArea = document.getElementById('chat');
                let div = document.createElement('div');
                div.className = 'container';
                if (textArea.childElementCount % 2) {
                    div.className += ' darker';
                }
                let p = document.createElement('p');
                p.innerText = `${label}: ${message}`;
                let span = document.createElement('span');
                span.innerText = new Date().toLocaleString();

                div.appendChild(p);
                div.appendChild(span);
                textArea.appendChild(div);

            }
        }

        document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    </script>
</head>
<body>
<p>Room Name is: <span id="pid"></span></p>
<button id="create" class="btn">Create a Room</button>
<br/>

<hr/>

<input type="text" id="room-id">
<button id="join" class="btn">Join a Room</button>

<hr/>

<div id="chat"></div>

<input id="chat-input"/><br/>
<button id="send" class="btn">Send</button>

<div id="announcements">

</div>
</body>
<style>
    body {
        margin: 0 auto;
        max-width: 800px;
        padding: 0 20px;
    }

    .container {
        border: 2px solid #dedede;
        background-color: #f1f1f1;
        border-radius: 5px;
        padding: 10px;
        margin: 10px 0;
    }

    .darker {
        border-color: #ccc;
        background-color: #ddd;
    }

    .container::after {
        content: "";
        clear: both;
        display: table;
    }

    .time-right {
        float: right;
        color: #aaa;
    }

    .time-left {
        float: left;
        color: #999;
    }

    textarea {
        resize: none;
    }
</style>
</html>
```

#### Using the Client Object

When you import the Liaison client into the page it makes a `Liaison` object globally available. Do not use
this object directly, this is an Object meant to be used as a prototype. To create an instance of the liaison 
object. You simply need to create an object from this object, like so:

```javascript
window.liaison = Object.create(Liaison);
```

::: tip Liaison Interface
This object has many methods in it's interface we'll only be looking at `connect`, `openChannel`, `onOpenChannel`,
`joinChannel`, `onJoinChannel`, `sendMessage`, and `onMessage` to learn more about the liaison object interface checkout 
the [client reference](/client).
:::

In order to begin interacting with our API's we first need to connect to them which we can do by calling `connect`.
If you wish to react to when the connection is established, the `connect` method takes a callback as an arugment.

```javascript
liaison.connect(() => {
    // Do Something
});
```

In our full code example mentioned above we first want to create a channel. To do that we simply need to call, `openChannel` 

```javascript
liaison.openChannel();
```

If we want to be able to react to this event when it succeeds, we need to set a callback for when the channel
is successfully opened prior to the `openChannel` call

```javascript
liaison.onOpenChannel((message) => {
    /* anatomy of message in onOpenChannel
    {
        channel: "String" // the channel id
    }
    */
})
```

The callback will a structured message with the attribute `channel` as a `String` containing the id of the channel.

Now that we have a channel id, a separate client can join that channel by calling `joinChannel` with that 
channel id, for example

```javascript
liaison.joinChannel(channel);
```

this will make a call to the Liaison services to add the calling client to the channel so that the client
can begin establishing P2P connections between the clients in the channel.

::: warning Note that you need a method of channel discovery
As part of Signaling you also need to account for discovery, there are many ways to share this channel id 
once you have it, you could generate a URL with it as a parameter and send that to people you want to join
your application, you could offer SMS hooks if the end-client is on mobile, etc. 

If you wanted to contain discovery to be inside of the signaling process, you could pre-create a channel 
with a hard-coded ID and a longer TTL, and have people join that hard-coded channel. For more information 
on the joinChannel API checkout the [API reference](/apis).
:::

Again if we want to be able to react to the event when it succeeds, we need to set a callback for when the client
successfully joins the channel prior to our `joinChannel` call.

```javascript
liaison.onJoinChannel((message) => {
    /* anatomy of message in onJoinChannel
    {
        user: "String" // id of the user that has joined the channel
        channel: "String" // id of the channel that was joined
        members: ["String"] // ids of the members of that channel, client included
    }
    */
});
```

When this is called, the client will begin establishing direct P2P connections between all clients on the channel. 
This means that they can now communicate via `sendMessage` without the help of the signaling services. 

At this point in our code, we can now have as many clients jump in as we want and they will all connect to each other 
in a direct P2P mesh as they join the channel. 

This can be confusing at times, let's a look at a clarifying example of 4 clients Molly, Mary, Manny, and Joe making a mesh.

Let's say Joe is the one that creates the room and then sends the channel id to Molly, Mary and Manny.
At which point they start joining in, say Molly joins first, then Mary, then Manny. This is what the 
liaison mesh creation will look like:

```coffeescript
# Joe is by himself
Joe 

# Molly joins
# Joe is connected to Molly 
# Molly is connected to Joe
Joe -> Molly 
Molly -> Joe

# Mary joins
# Joe is connected to Molly and Mary
# Molly is connected to Joe and Mary
# Mary is connected to Molly and Joe
Joe -> Molly 
Joe -> Mary
Molly -> Joe
Molly -> Mary
Mary -> Molly
Mary -> Joe

# Manny joins
# Joe is connected to Molly, Mary, and Manny
# Molly is connected to Joe, Mary, and Manny
# Mary is connected to Molly, Joe, and Manny
# Manny is connected to Joe, Mary, and Molly
Joe -> Molly 
Joe -> Mary
Joe -> Manny
Molly -> Joe
Molly -> Mary
Molly -> Manny
Mary -> Molly
Mary -> Joe
Mary -> Manny
Manny -> Joe
Manny -> Mary
Manny -> Molley
```

However because you're using the web client, this is all opaque to you, and `sendMessage` will send  a message to 
anyone you're connected to in your mesh. In the example of our chat application illustrated above, that means
when I want to message everyone in my mesh, I can simply write:

```javascript
liaison.sendMessage('Hello!');
```

and all the other clients will receive the message. However, if you want to be able to react to the message,
then of course you're going to have needed to set up an `onMessage` callback, prior to `sendMessage`.

```javascript
liaison.onMessage((message) => {
    // message.data contains "Hello!"
});
```

Because the messages being sent are now part of a [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
[RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) the message you get back will be a [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent).

::: tip You can chain liaison method calls
Each liaison function returns the liaison object itself you can daisy chain calls like so

```javascript
liaison.connect(() => {
    // Do Something
}).onJoinChannel((message) => {
    // Do Something
}).onOpenChannel((message) => {
    // Do Something
}).onMessage((message) => {
    // Do Something
});
```
:::

You can try out this code by either running it yourself across multiple clients, or navigating to the [demo website](http://liaison-demo.shootthebit.com/)

::: danger Signaling message sending back-channel
If there's a case that is not covered where you need to send messages to member of a channel through the liaison
signaling service directly you can use the underlying communication mechanism of the liaison object. The callback methods 
discussed above leverage the liaison object's `on` and `off` methods for subscribing and subscribing to events being
send through the services, and you can send custom messages using the private `_send` method.

If however you find yourself thinking that you need to do this, I would first reach out to support 
<a href="mailto:liaison+support@gmail.com">liaison+support@gmail.com</a> to see if it's a valid use-case.
:::

## Learn More

This example was a simple chat application sending string messages back and forth through the mesh, but as
you can imagine there's much more that you can do by sending structured messages and reacting to those structured
messages throughout your different clients. 

There might be some questions you have after reading this guide around the specifics of the services and client.

* What do the raw Service API's look like?
* What other methods does the client have?
* What is the cost of these services going to look like?

Here are some links to help you answer some of those questions:

* [Signaling Services API](/apis)
* [Liaison Client Reference](/client)
* [Liaison Signaling Pricing](/pricing)
