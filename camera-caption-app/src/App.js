import React, { useRef, useState } from 'react';
import './App.css'; // Add similar CSS from your HTML file

function App() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [caption, setCaption] = useState(null);
    const [audioPath, setAudioPath] = useState(null);

    // Access the camera
    React.useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => {
                alert("Camera access is required to capture images.");
                console.error("Camera error:", err);
            });
    }, []);

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);

        // Send image to backend
        generateCaption(imageData);
    };


    const generateCaption = (imageData) => {
        setLoading(true);
        fetch('http://localhost:5000/generate-caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_data: imageData }),
        })
            .then((response) => response.json())
            .then((data) => {
                setLoading(false);
                if (data.error) {
                    alert(data.error);
                } else {
                    setCaption(data.caption);
                    setAudioPath(data.audio_path);
                }
            })
            .catch((error) => {
                setLoading(false);
                console.error("Error:", error);
                alert("An error occurred while generating the caption.");
            });
    };

    return (
        <div className="App">
            <header className="App-header">Camera Caption Generator</header>
            <main>
                <video ref={videoRef} autoPlay></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                {capturedImage && <img src={capturedImage} alt="Captured" />}
                <button onClick={captureImage}>Capture and Generate Caption</button>
                {loading && <div>🔄 Generating caption, please wait...</div>}
                {caption && <p>Caption: {caption}</p>}
                {audioPath && <audio controls src={`http://localhost:5000${audioPath}`}></audio>}
            </main>
        </div>
    );
}

export default App;
