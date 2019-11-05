const io = require("socket.io-client");
// let Peer = require("simple-peer");

const socket = io.connect("http://localhost:3000");
// let peer;
const room = "foo"; // Could prompt for room name: // room = prompt('Enter room name:');

let isChannelReady = false;
let isInitiator = false;
let isStarted = false;
let turnReady; // currently unused

const pcConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};

/////////////////// Client Signal Server Using Socket IO ///////////////////

// starts socket client communication with signal server automatically
if (room !== "") {
  socket.emit("create or join", room);
  console.log("Attempted to create or join room", room);
}

socket.on("created", room => {
  console.log("Created room " + room);
  isInitiator = true;
});

// room only holds two clients, can be changed in signal_socket.js
socket.on("full", room => {
  console.log("Room " + room + " is full");
});

// called by initiator client only
socket.on("join", room => {
  console.log("Another peer made a request to join room " + room);
  console.log("This peer is the initiator of room " + room + "!");
  isChannelReady = true;
});

// called by non-initiator client
socket.on("joined", room => {
  console.log("joined: " + room);
  isChannelReady = true;
});

// logs messages from server
socket.on("log", array => {
  console.log.apply(console, array);
});

// This client receives a message
socket.on("message", message => {
  console.log("MESSAGE", message);

  if (message.type) {
    console.log("received msg typ ", message.type);
  } else {
    console.log("Client received message:", message);
  }

  if (message === "start peer connection") {
    maybeStart();
  } else if (message.type === "sending signal") {
    console.log("receiving simple signal data");

    // if (!peer) {
    //   createPeerConnection(isInitiator);
    //   peer.signal(message.data);
    // } else {
    //   peer.signal(message.data);
    // }
  } else if (message === "bye" && isStarted) {
    handleRemoteHangup();
  }
});

function sendMessage(message) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

function init() {
  sendMessage("start peer connection");
  if (isInitiator) {
    maybeStart();
  }
}

function maybeStart() {
  console.log(">>>>>>> maybeStart() ", isStarted, isChannelReady);
  if (!isStarted && isChannelReady) {
    console.log(">>>>>> creating peer connection");
    console.log("isInitiator", isInitiator);

    createPeerConnection(isInitiator);
    isStarted = true;
  }
}

window.socketClient = socket;
