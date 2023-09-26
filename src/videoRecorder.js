import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import RecordRTC from 'recordrtc';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTbIxQmqNOkPVfwPbUc5GAvWOVW37PUyI",
    authDomain: "video-stream-demo-c4c20.firebaseapp.com",
    projectId: "video-stream-demo-c4c20",
    storageBucket: "video-stream-demo-c4c20.appspot.com",
    messagingSenderId: "250572019373",
    appId: "1:250572019373:web:8191e6821a03ad25051824"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const VideoRecorder = () => {
    const webcamRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedVideoURL, setRecordedVideoURL] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // Create a reference to the Firebase storage bucket
    const storage = getStorage();
    const storageRef = ref(storage, 'videos/' + Date.now() + '.webm');

    const startRecording = async () => {
        if (webcamRef.current) {
            const stream = webcamRef.current.video.srcObject;
            const recorder = new RecordRTC(stream, {
                type: 'video',
                mimeType: 'video/webm',
            });

            recorder.startRecording();

            setMediaRecorder(recorder);
            setRecording(true);
        }
    };

    const stopRecording = async () => {
        if (mediaRecorder) {
            mediaRecorder.stopRecording(async () => {
                const blob = mediaRecorder.getBlob();
                const videoURL = URL.createObjectURL(blob);

                setRecordedVideoURL(videoURL);

                // Upload the recorded video to Firebase Storage
                await uploadString(storageRef, blob, 'raw');

                setRecording(false);
            });
        }
    };


    return (
        <div className="video-recorder">
            <Webcam
                audio={false}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                className="webcam"
            />
            <div className="controls">
                {recording ? (
                    <button onClick={stopRecording}>Stop Recording</button>
                ) : (
                    <button onClick={startRecording}>Start Recording</button>
                )}
            </div>
            {recordedVideoURL && (
                <video src={recordedVideoURL} controls className="recorded-video" />
            )}
        </div>
    );
};

export default VideoRecorder;