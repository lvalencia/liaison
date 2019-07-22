import _ from 'underscore';

const uuid = uuidv4;

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
    connect(callback) {
        this.ws = new WebSocket(SIGNALING_WS_URL);
        this.ws.addEventListener('open', callback);
        this.ws.addEventListener('message', this._messagesHandler.bind(this));
        this.on(HANDSHAKE.EVENT, this._handshakeHandlerAsync.bind(this));
        this.on(HANDSHAKE.CANDIDATE, this._candidateHandlerAsync.bind(this));
        return this;
    },
    on(eventName, callback) {
        this.events.push({eventName, callback});
        return this;
    },
    off(eventName) {
        this.events = _.reject(this.events, (event) => {
            return event.eventName === eventName
        });
        return this;
    },
    onError(callback) {
        this.on(ACTION.ERROR, callback);
        return this;
    },
    onOpenChannel(callback) {
        this.on(ACTION.OPEN_CHANNEL, callback);
        return this;
    },
    openChannel() {
        this._send({
            action: ACTION.OPEN_CHANNEL
        });
        return this;
    },
    onJoinChannel(callback) {
        this.on(ACTION.JOIN_CHANNEL, callback);
        return this;
    },
    joinChannel(channel) {
        this._send({
            action: ACTION.JOIN_CHANNEL,
            channel
        });
        return this;
    },
    send(channel, data) {
        this._send({
            action: ACTION.SEND_MESSAGE,
            channel,
            data
        });
        return this;
    },
    onDataChannelCreate(callback) {
        const dataChannel = this.peerConnection.createDataChannel(uuid(), {negotiated: true, id:0});
        callback({channel: dataChannel});
        return this;
    },
    async initDataChannelWith(channel) {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.peerConnection.onicecandidate = (function sendIceCandidate({candidate}) {
                this.send(channel, {
                    action: HANDSHAKE.CANDIDATE,
                    candidate,
                });
            }).bind(this);
            this.send(channel, {
                action: HANDSHAKE.EVENT,
                channel,
                desc: this.peerConnection.localDescription,
            });
        } catch (err) {
            console.error(err);
        }
    },
    // "private" methods
    _send({action, data, channel}) {
        let payload = {action};
        if (!_.isEmpty(channel)) {
            payload = _.extend(payload, {channel});
        }
        if (!_.isEmpty(data)) {
            payload = _.extend(payload, {data});
        }
        this.ws.send(JSON.stringify(payload));
    },
    _messagesHandler(event) {
        const message = JSON.parse(event.data);
        const {callback} = _.findWhere(this.events, {eventName: message.action});
        callback(message);
    },
    async _handshakeHandlerAsync({desc, channel}) {
        const {type} = desc;
        if (type === HANDSHAKE.OFFER) {
            await this._offerReceivedAsync({desc, channel});
        } else if (type === HANDSHAKE.ANSWER) {
            await this._answerReceivedAsync({desc, channel});
        } else {
            console.log('Unsupported SDP type.');
        }
    },
    async _offerReceivedAsync({desc, channel}) {
        await this.peerConnection.setRemoteDescription(desc);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.peerConnection.onicecandidate = (function sendIceCandidate({candidate}) {
            this.send(channel, {
                action: HANDSHAKE.CANDIDATE,
                candidate,
            });
        }).bind(this);
        this.send(channel, {
            action: HANDSHAKE.EVENT,
            channel,
            desc: this.peerConnection.localDescription
        });
    },
    async _answerReceivedAsync({desc, channel}) {
        await this.peerConnection.setRemoteDescription(desc);
    },
    async _candidateHandlerAsync({candidate}) {
        try {
            await this.peerConnection.addIceCandidate(candidate);
        } catch (e) {
            console.log(e);
        }
    },
    // Getters / Setters
    get events() {
        this.registeredEvents = this.registeredEvents || [];
        return this.registeredEvents;
    },
    set events(registeredEvents) {
        this.registeredEvents = registeredEvents;
    },
    get peerConnection() {
        if (this.pc) {
            return this.pc;
        }

        const configuration = {
            iceServers: [
                {urls: "stun:stun.1.google.com:19302"}
            ]
        };

        this.pc = new RTCPeerConnection(configuration);

        return this.pc;
    }
};

Object.freeze(Signaling);

export {Signaling};
