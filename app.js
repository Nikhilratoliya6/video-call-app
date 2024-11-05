let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localTrack, remoteTrack;

// Agora App ID
const APP_ID = 'YOUR_APP_ID';
// Get channel name from URL, default to 'defaultChannel'
const urlParams = new URLSearchParams(window.location.search);
const CHANNEL = urlParams.get('channel') || 'defaultChannel';
// Token (optional, can be left null if token is not required)
const TOKEN = null;

async function startCall() {
    try {
        // Join the channel
        await client.join(APP_ID, CHANNEL, TOKEN, null);

        // Create local audio and video tracks
        localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();

        // Play the local video in the 'local-player' container
        localTrack[1].play("local-player");

        // Publish local tracks to the channel
        await client.publish(localTrack);

        console.log("Successfully joined the call in channel:", CHANNEL);
    } catch (error) {
        console.error("Failed to join the call:", error);
    }

    // Listen for remote users joining
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("Subscribed to remote user:", user.uid);

        if (mediaType === "video") {
            remoteTrack = user.videoTrack;
            remoteTrack.play("remote-player");
        }
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    // Listen for remote users leaving
    client.on("user-unpublished", (user) => {
        if (remoteTrack) {
            remoteTrack.stop();
            console.log("Remote user left the call.");
        }
    });
}

async function leaveCall() {
    // Leave the channel and close tracks
    if (localTrack) {
        localTrack[0].stop();
        localTrack[0].close();
        localTrack[1].stop();
        localTrack[1].close();
    }
    await client.leave();
    console.log("Left the call.");
}
