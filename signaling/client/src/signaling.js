import _ from 'underscore';

const uuid = function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const SIGNALING_WS_URL = 'wss://5qucnj0ap2.execute-api.us-east-1.amazonaws.com/dev';

const ACTION = {
    OPEN_CHANNEL: 'openChannel',
    SEND_MESSAGE: 'sendMessage',
    JOIN_CHANNEL: 'joinChannel',
    ERROR: 'error'
};

const HANDSHAKE = {
    EVENT: 'handshakeEvent',
    OFFER: 'offer',
    ANSWER: 'answer',
    CANDIDATE: 'candidate'
};

const Signaling = {
    // Public
    connect(callback) {
        this.ws = new WebSocket(SIGNALING_WS_URL);
        this.ws.addEventListener('open', callback);
        this.ws.addEventListener('message', this._messagesHandler.bind(this));
        this.on(HANDSHAKE.EVENT, this._handshakeHandlerAsync.bind(this));
        this.on(HANDSHAKE.CANDIDATE, this._candidateHandlerAsync.bind(this));
        return this;
    },
    on(eventName, callback) {
        this.off(eventName);
        this.events.push({eventName, callback});
        return this;
    },
    off(eventName) {
        this.events = _.reject(this.events, (event) => {
            return event.eventName === eventName
        });
        return this;
    },
    onOpenChannel(callback) {
        this.on(ACTION.OPEN_CHANNEL, (function openChannelAugmentedCallback(message) {
            this._openChannelCallback(message);
            callback(message);
        }).bind(this));
        return this;
    },
    openChannel() {
        if (!this._hasEvent(ACTION.JOIN_CHANNEL)) {
            this.on(ACTION.OPEN_CHANNEL, this._openChannelCallback.bind(this));
        }

        this._send({
            action: ACTION.OPEN_CHANNEL
        });
        return this;
    },
    onJoinChannel(callback) {
        this.on(ACTION.JOIN_CHANNEL, (function joinChannelAugmentedCallback(message) {
            const {data} = message;
            this._joinChannelCallback(data);
            callback(data);
        }).bind(this));

        return this;
    },
    joinChannel(channel) {
        if (!this._hasEvent(ACTION.JOIN_CHANNEL)) {
            this.on(ACTION.JOIN_CHANNEL, this._joinChannelCallback.bind(this));
        }

        this._send({
            action: ACTION.JOIN_CHANNEL,
            channel
        });
        return this;
    },
    onError(callback) {
        this.on(ACTION.ERROR, callback);
        return this;
    },
    onMessage(callback) {
        this.messageCallback = callback;
        return this;
    },
    sendMessage(data) {
        this.rtcConnections.forEach(({dataChannel}) => {
            dataChannel.send(JSON.stringify(data));
        });
    },
    // Private
    _send({action, data, channel, meta}) {
        let payload = {action};
        if (!_.isEmpty(channel)) {
            payload = _.extend(payload, {channel});
        }
        if (!_.isEmpty(data)) {
            payload = _.extend(payload, {data});
        }
        if (!_.isEmpty(meta)) {
            payload = _.extend(payload, {meta});
        }
        this.ws.send(JSON.stringify(payload));
    },
    _hasEvent(eventName) {
        return !!_.findWhere(this.events, {eventName});
    },
    _messagesHandler(event) {
        const message = JSON.parse(event.data);

        if (message.action) {
            const {callback} = _.findWhere(this.events, {eventName: message.action});
            callback(message);
        } else {
            console.log(`Cannot Handle message.action undefined for message: ${JSON.stringify(message)}`);
        }

    },
    _openChannelCallback(message) {
        const {
            meta: {
                sender
            }
        } = message;
        this.id = sender;
    },
    _joinChannelCallback(message) {
        const {user, channel, members} = message;
        this.id = user;

        if (this.id === user) {
            members.forEach((member) => {
                if (member !== user) {
                    const connection = this._createConnection({label: member});
                    this.rtcConnections.push(connection);
                    this._establishConnection({
                        rtcPeerConnection: connection.rtcPeerConnection,
                        channel,
                        member
                    });
                }
            });
        }
    },
    _createConnection({label, createDataChannel = true}) {
        const configuration = {
            iceServers: [
                {urls: "stun:stun.1.google.com:19302"}
            ]
        };

        const rtcPeerConnection = new RTCPeerConnection(configuration);
        let dataChannel;
        if (createDataChannel){
            dataChannel = rtcPeerConnection.createDataChannel(label);
            dataChannel.onmessage = this.messageCallback;
        } else {
            rtcPeerConnection.ondatachannel = (function ({channel}) {
                this._addDataChannel({channel, label});
            }).bind(this);
        }

        return {
            label,
            dataChannel,
            rtcPeerConnection
        }
    },
    _addDataChannel({channel, label}) {
        let connection = _.find(this.rtcConnections, (connection) => {
            return connection.label === label;
        });
        connection.dataChannel = channel;
        connection.dataChannel.onmessage = this.messageCallback;
    },
    async _establishConnection({rtcPeerConnection, channel, member}){
        try {
            const offer = await rtcPeerConnection.createOffer();
            await rtcPeerConnection.setLocalDescription(offer);
            rtcPeerConnection.onicecandidate = (function sendIceCandidate({candidate}) {
                this._send({
                    action: ACTION.SEND_MESSAGE,
                    meta: {
                        sender: this.id,
                        recipient: member
                    },
                    channel,
                    data: {
                        action: HANDSHAKE.CANDIDATE,
                        candidate
                    }
                });
            }).bind(this);

            this._send({
                action: ACTION.SEND_MESSAGE,
                meta: {
                    sender: this.id,
                    recipient: member
                },
                channel,
                data: {
                    action: HANDSHAKE.EVENT,
                    channel,
                    desc: rtcPeerConnection.localDescription
                }
            });
        } catch (err) {
            console.error(err);
        }
    },
    async _handshakeHandlerAsync({meta, desc, channel}) {
        const {sender} = meta;
        let {rtcPeerConnection} = this._connectionForLabel(sender);

        const {type} = desc;
        if (type === HANDSHAKE.OFFER) {
            await this._offerReceivedAsync({
                rtcPeerConnection,
                meta,
                desc,
                channel
            });
        } else if (type === HANDSHAKE.ANSWER) {
            await this._answerReceivedAsync({
                rtcPeerConnection,
                desc
            });
        } else {
            console.log('Unsupported SDP type.');
        }
    },
    async _offerReceivedAsync({rtcPeerConnection, meta, desc, channel}) {
        await rtcPeerConnection.setRemoteDescription(desc);
        const answer = await rtcPeerConnection.createAnswer();
        await rtcPeerConnection.setLocalDescription(answer);
        rtcPeerConnection.onicecandidate = (function sendIceCandidate({candidate}) {
            this._send({
                action: ACTION.SEND_MESSAGE,
                meta: {
                    sender: this.id,
                    recipient: meta.sender
                },
                channel,
                data: {
                    action: HANDSHAKE.CANDIDATE,
                    candidate,
                }
            });
        }).bind(this);

        this._send({
            action: ACTION.SEND_MESSAGE,
            meta: {
                sender: this.id,
                recipient: meta.sender
            },
            channel,
            data: {
                action: HANDSHAKE.EVENT,
                desc: rtcPeerConnection.localDescription
            }
        });
    },
    async _answerReceivedAsync({rtcPeerConnection, desc}) {
        await rtcPeerConnection.setRemoteDescription(desc);
    },
    async _candidateHandlerAsync({meta, candidate}) {
        const {sender} = meta;
        let {rtcPeerConnection} = this._connectionForLabel(sender);

        try {
            await rtcPeerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.log(e);
        }
    },
    _connectionForLabel(label) {
        let connection = _.find(this.rtcConnections, (connection) => {
            return connection.label === label;
        });
        if (!connection) {
            connection = this._createConnection({
                label,
                createDataChannel: false
            });
            this.rtcConnections.push(connection);
        }

       return connection;
    },
    // Getters / Setters
    get rtcConnections() {
        this.connections = this.connections || [];
        return this.connections;
    },
    get dataChannelId() {
        return this.rtcConnections.length;
    },
    get events() {
        this.registeredEvents = this.registeredEvents || [];
        return this.registeredEvents;
    },
    set events(registeredEvents) {
        this.registeredEvents = registeredEvents;
    },
    get id() {
        return this.connectionId;
    },
    set id(id) {
        if (!this.connectionId) {
            this.connectionId = id;
        }
    }
};

Object.freeze(Signaling);

export {Signaling};
