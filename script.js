const PRE = "DELTA"
const SUF = "MEET"
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null
var screenSharing = false
function createRoom() {
    console.log("Creating Room")
    let room = document.getElementById("room-input").value;
    if (room == " " || room == "") {
        alert("Please enter room number")
        return;
    }
    room_id = PRE + room + SUF;
    peer = new Peer(room_id)
    peer.on('open', (id) => {
        console.log("Peer Connected with ID: ", id)
        hideModal()
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setLocalStream(local_stream)
        }, (err) => {
            console.log(err)
        })
        notify("Waiting for peer to join.")
    })
    peer.on('call', (call) => {
        call.answer(local_stream);
        call.on('stream', (stream) => {
            setRemoteStream(stream)
        })
        currentPeer = call;
    })
}

function setLocalStream(stream) {

    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.play();
}
function setRemoteStream(stream) {

    let video1 = document.getElementById("remote-video");
    video1.srcObject = stream;
    video1.muted = true;
    video1.play();
    

// document.querySelector('a-scene').innerHTML += `  <a-entity material="shader: flat; side: double; src: #remote-video" geometry="primitive: cylinder; radius: 5; height: 3.6815; open-ended: true; theta-start: 142.5; theta-length: 75; position="0 1.5 0" rotation="0 0 0" scale="-1 1 1"></a-entity>`;
// var video = document.createElement('a-entity');
// video.setAttribute('src', '#remote-video');
// video.setAttribute('height', 3)

    // var video = document.createElement("a-video");
    //       video.setAttribute("src", "#remote-video");
    //       video.setAttribute("width", "2");
    //       video.setAttribute("height", "1.125");
    //       video.setAttribute("rotation", "20 -30 0");
    //       video.setAttribute("position", "1 2 -0.3");
    //       video.addEventListener("loaded", function () {
    //         document.getElementById("videoclip").load();
    //         document.getElementById("videoclip").play();
    //       });
    //       document.querySelector("a-scene").appendChild(video);
    //     //   this.remove();

    //       var video2 = document.createElement("a-video");
    //       video2.setAttribute("src", "#remote-video");
    //       video2.setAttribute("width", "2");
    //       video2.setAttribute("height", "1.125");
    //       video2.setAttribute("rotation", "20 30 0");
    //       video2.setAttribute("position", "-0.5 2 -0.5");
    //       video2.addEventListener("loaded", function () {
    //         document.getElementById("videoclip").load();
    //         document.getElementById("videoclip").play();
    //       });
    //       document.querySelector("a-scene").appendChild(video2);
    //       this.remove();
    //       console.log('yes this works!!')

}

function hideModal() {
    document.getElementById("entry-modal").hidden = true
}

function notify(msg) {
    let notification = document.getElementById("notification")
    notification.innerHTML = msg
    notification.hidden = false
    setTimeout(() => {
        notification.hidden = true;
    }, 3000)
}

function joinRoom() {
    console.log("Joining Room")
    let room = document.getElementById("room-input").value;
    if (room == " " || room == "") {
        alert("Please enter room number")
        return;
    }
    room_id = PRE + room + SUF;
    hideModal()
    peer = new Peer()
    peer.on('open', (id) => {
        console.log("Connected with Id: " + id)
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setLocalStream(local_stream)
            notify("Joining peer")
            let call = peer.call(room_id, stream)
            call.on('stream', (stream) => {
                setRemoteStream(stream);
            })
            currentPeer = call;
        }, (err) => {
            console.log(err)
        })

    })
}

function startScreenShare() {
    if (screenSharing) {
        stopScreenSharing()
    }
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        screenStream = stream;
        let videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => {
            stopScreenSharing()
        }
        if (peer) {
            let sender = currentPeer.peerConnection.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            sender.replaceTrack(videoTrack)
            screenSharing = true
        }
        console.log(screenStream)
    })
}

function stopScreenSharing() {
    if (!screenSharing) return;
    let videoTrack = local_stream.getVideoTracks()[0];
    if (peer) {
        let sender = currentPeer.peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
    }
    screenStream.getTracks().forEach(function (track) {
        track.stop();
    });
    screenSharing = false
}