const PRE = "SCREEN-"
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
// var peer = null, peer2 = null;
var currentPeer = null, currentPeer2 = null
var screenSharing = false




// function setLocalStream(stream) {

//     let video = document.getElementById("local-video");
//     video.srcObject = stream;
//     video.muted = true;
//     video.play();
// }
function setRemoteStream(stream1, stream2) {

    let video1 = document.getElementById("remote-video");
    video1.srcObject = stream1;
    video1.muted = true;
    video1.play();

    if(stream2) {
        console.log('setting second stream')
        let video2 = document.getElementById("remote-video-2");
        video2.srcObject = stream2;
        video2.muted = true;
        video2.play();
    }
    

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

function joinRoom(room_id) {
    // console.log("Joining Room")
    // let room = document.getElementById("room-input").value;
    // if (room == " " || room == "") {
    //     alert("Please enter room number")
    //     return;
    // }
    // room_id = PRE + room;
    // hideModal()
    peer = new Peer()
    peer2 = new Peer()
    peer.on('open', (id) => {
        console.log("Connected with Id: " + id)
        // getUserMedia({ video: false, audio: false }, (stream) => {
        //     local_stream = stream;
            // setLocalStream(local_stream)
            notify("Joining peer")
            let call = peer.call(room_id, stream)
            call.on('stream', (stream) => {
                console.log('multiple', stream)
                setRemoteStream(stream);
            })
            currentPeer = call;
        // }, (err) => {
            // console.log(err)
        // })

    })
    peer2.on('open', (id) => {
        console.log("Connected with Id: " + id)
        // getUserMedia({ video: true, audio: true }, (stream) => {
        //     local_stream = stream;
        //     setLocalStream(local_stream)
            notify("Joining peer")
            let call = peer2.call("screens", new MediaStream())
            call.on('stream', (stream) => {
                console.log('multiple', stream)
                setRemoteStream(null, stream);
            })
            currentPeer2 = call;
        // }, (err) => {
        //     console.log(err)
        // })

    })
}

async function startScreenShare() {
    if (screenSharing) {
        stopScreenSharing()
    }
    return await navigator.mediaDevices.getDisplayMedia({ video: true });
    // .then((stream) => {
        // local_stream = stream;
        // screenStream = stream;
        // let videoTrack = screenStream.getVideoTracks()[0];
        // videoTrack.onended = () => {
        //     stopScreenSharing()
        // }
        // if (peer) {
        //     let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        //         return s.track.kind == videoTrack.kind;
        //     })
        //     sender.replaceTrack(videoTrack)
        //     navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream2) => {
        //         let videoTrack2 = stream2.getVideoTracks()[0];
        //         let sender2 = currentPeer2.peerConnection.getSenders().find(function (s) {
        //             return s.track.kind == videoTrack2.kind;
        //         })
        //         console.log('found sender 2', sender2)
        //         sender2.replaceTrack(videoTrack2) 
        //         screenSharing = true
        //     });
        // }
    // })
    // .catch(error => {
    //     console.log('err', error)
    // }) 
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