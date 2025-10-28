const video = document.getElementById('video');
const statusEl = document.getElementById('status');

async function loadModels() {
  statusEl.textContent = "⏳ Loading AI models...";
  try {
    // ✅ Load directly from CDN (no /models folder needed)
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/'),
      faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/'),
      faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/')
    ]);
    statusEl.textContent = "✅ Models loaded! Starting camera...";
    startVideo();
  } catch (e) {
    console.error("Error loading models:", e);
    statusEl.textContent = "❌ Error loading AI models.";
  }
}

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.addEventListener('play', analyzeEmotions);
    })
    .catch(err => {
      console.error('Camera access error:', err);
      statusEl.textContent = "⚠️ Please allow camera access.";
    });
}

async function analyzeEmotions() {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(video, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()
      .withAgeAndGender();

    if (detections.length > 0) {
      const { age, gender } = detections[0];
      const emotion = detections[0].expressions.asSortedArray()[0].expression;
      statusEl.textContent = `Detected: ${emotion} | ${gender} | Age: ${Math.round(age)}`;
    }
  }, 2000);
}

function selectSubject(subject) {
  document.querySelector('.subjects').style.display = 'none';
  document.querySelector('.ai-section').style.display = 'block';
  document.getElementById('backBtn').style.display = 'block';
  document.getElementById('status').textContent = `Selected: ${subject}`;
  loadModels();
}

function goBack() {
  document.querySelector('.subjects').style.display = 'flex';
  document.querySelector('.ai-section').style.display = 'none';
  document.getElementById('status').textContent = "";
  document.getElementById('backBtn').style.display = 'none';
}
