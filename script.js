// ----------------------------
// Emotion-Aware AI Tutor Script
// ----------------------------

// ✅ Correct GitHub Pages path for model loading
const MODEL_URL = 'https://rakg007.github.io/Emotion-Aware-AI-Tutor/models';

// Wait for face-api.js models to load
async function loadModels() {
  document.getElementById('status').innerText = 'Loading AI models...';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
  ]);
  document.getElementById('status').innerText = 'Models loaded! Starting camera...';
  startVideo();
}

// Start webcam feed
function startVideo() {
  const video = document.getElementById('video');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error(err);
      alert('Please allow camera access for emotion detection.');
    });
}

// Analyze emotions continuously
async function onPlay() {
  const video = document.getElementById('video');
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector('.video-container').append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()
      .withAgeAndGender();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (detections.length > 0) {
      const { expressions } = detections[0];
      const emotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
      speakFeedback(emotion);
    }
  }, 2000);
}

// Voice feedback
function speakFeedback(emotion) {
  const synth = window.speechSynthesis;
  let message = '';

  switch (emotion) {
    case 'happy': message = 'You look happy! Keep learning with enthusiasm!'; break;
    case 'sad': message = 'Feeling down? Let’s make learning more fun!'; break;
    case 'angry': message = 'Take a deep breath. Let’s focus calmly.'; break;
    case 'surprised': message = 'Surprised? That’s great curiosity!'; break;
    default: message = 'Keep going, you’re doing great!'; break;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  synth.cancel(); // stop overlapping voices
  synth.speak(utterance);
}

// Start once page loads
window.addEventListener('load', loadModels);
