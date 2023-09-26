import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { storage } from './firebaseConfig';
import { FiCamera, FiStopCircle, FiMic, FiVideo } from 'react-icons/fi';

export default function VideoRecording() {
  const webcamRef = useRef(null);
  const [recordingStatus, setRecordingStatus] = useState('notRecording');
  const [audioBlob, setAudioBlob] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('recording');
  const [isMicOn, setIsMicOn] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null); 
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsMicOn(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopMicrophone = () => {
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
      setIsMicOn(false);
    }
  };

  const handleStartRecording = async () => {
    if (recordingStatus === 'uploaded') {
      setRecordingStatus('notRecording');
      setVideoUrl(null);
      setAudioBlob(null);
    }
  
    const recorder = new MediaRecorder(webcamRef.current.stream);
    setMediaRecorder(recorder);
    const audioRecorder = new RecordRTC(webcamRef.current.stream, {
      type: 'video',
      mimeType: 'video/webm',
      recorderType: StereoAudioRecorder,
      audio: micStream,
    });
  
    const recordedChunks = [];
  
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
  
    recorder.onstop = async () => {
      audioRecorder.stopRecording(() => {
        const audioBlob = audioRecorder.getBlob();
        setAudioBlob(audioBlob);
        stopMicrophone();
      });
  
      const videoBlob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
  
      const videoFile = new File([videoBlob], 'video.webm', {
        type: 'video/webm',
      });
  
      const audioFile = new File([audioBlob], 'audio.wav', {
        type: 'audio/wav',
      });
  
      const videoRef = ref(storage, 'videos/video.webm');
      const audioRef = ref(storage, 'audio/audio.wav');
  
      try {
        console.log('Uploading video file...');
        await uploadBytes(videoRef, videoFile);
        console.log('Video file uploaded successfully.');
  
        console.log('Uploading audio file...');
        await uploadBytes(audioRef, audioFile);
        console.log('Audio file uploaded successfully.');
  
        const videoDownloadURL = await getDownloadURL(videoRef);
        setVideoUrl(videoDownloadURL);
  
        setRecordingStatus('uploaded');
        console.log('Recording uploaded successfully!');
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    };
  
    recorder.start();
    audioRecorder.startRecording();
    startMicrophone();
    setRecordingStatus('recording');
  };

  const handleStopRecording = async () => {
    setRecordingStatus('stopped');

    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-400">
      <div className="flex space-x-4">
        <button
          onClick={() => handleTabChange('recording')}
          className={`flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-4 ${
            activeTab === 'recording' ? 'bg-blue-700' : ''
          }`}
        >
          <FiCamera className="mr-2" /> Record
        </button>
        <button
          onClick={() => handleTabChange('video')}
          className={`flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-4 ${
            activeTab === 'video' ? 'bg-blue-700' : ''
          }`}
        >
          <FiVideo className="mr-2" /> View Video
        </button>
      </div>

      {activeTab === 'recording' && (
        <>
          <Webcam audio ref={webcamRef} className="border rounded mb-4" />
          {recordingStatus === 'notRecording' && (
            <button
              onClick={handleStartRecording}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-4"
            >
              <FiCamera className="mr-2" /> Start Recording
            </button>
          )}
          {recordingStatus === 'recording' && (
            <button
              onClick={handleStopRecording}
              className="flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mb-4"
            >
              <FiStopCircle className="mr-2" /> Stop Recording
            </button>
          )}
          {recordingStatus === 'uploaded' && videoUrl && (
            <div className="mb-4">
              <p className="text-lg font-bold text-green-600">Recording uploaded successfully!</p>
            </div>
          )}
          {micStream && isMicOn && (
            <div className="flex items-center justify-center border rounded p-4">
              <FiMic className="text-blue-500 mr-2" /> Microphone Enabled
            </div>
          )}
        </>
      )}

      {activeTab === 'video' && (
        <>
          {recordingStatus === 'uploaded' && videoUrl ? (
            <div className="mb-4">
              <video controls src={videoUrl} className="border rounded" />
            </div>
          ) : (
            <div className="flex items-center justify-center border rounded p-4">
              <FiVideo className="text-blue-500 mr-2" /> No recorded video available
            </div>
          )}
        </>
      )}
    </div>
  );
}
