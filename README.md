# Liaison

Liaison is a project to facilitate P2P direct communication through WebRTC. It implements solutions for 
User discovery and communication, Signaling, NAT/Firewall Traversal, and Relay for P2P fail-overs.

http://liaison.shootthebit.com/

## Packages

The following packages are in this repo.

### Signaling

#### @liaison/signaling-connect

Lambda signaling behavior for when a Websocket opens a connection with our back-end.

#### @liaison/signaling-disconnect

Lambda signaling behavior for when a Websocket closes a connection with our back-end.

#### @liaison/signaling-open-channel

Lambda for opening/creating a channel for which peers can communicate through for initial 
discovery.

#### @liaison/signaling-close-channel

Lambda for closing a channel in which peers are communicating through during initial discovery.

#### @liaison/signaling-join-channel

Lambda for joining a channel in which peers will communicate through during initial discovery.

#### @liaison/signaling-leave-channel

Lambda for leaving a channel in which peers are communicating through during initial discovery.

#### @liaison/signaling-send-message

Lambda for P2P Websocket communication.

### STUN

Not yet implemented.

### TURN

Not yet implemented.
