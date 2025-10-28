// === Emotion-Aware AI Tutor Script ===

// Safety check for face-api.js
if (typeof faceapi === "undefined") {
  alert("⚠️ face-api.js failed to load! Please check your internet connection or CDN link.");
  throw new Error("face-api.js not loaded");
}

const statusEl = document.getElementById("status");
const video = document.getElementById("video");
const backBtn = document.getElementById("backBtn");

// Load AI models from CDN
async function loadModels() {
  try {
    statusEl.innerText = "⏳ Loading AI models...";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights"),
      faceapi.nets.faceExpressionNet.loadFromUri("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights")
    ]);
    statusEl.innerText = "✅ Models loaded!";
  } catch (err) {
    console.error("Model loading failed:", err);
    statusEl.innerText = "❌ Error loading AI models.";
  }
}

// Handle subject selection
window.selectSubject = async function (subject) {
  try {
    document.querySelector(".subjects").style.display = "none";
    document.querySelector(".ai-section").style.display = "flex";
    document.querySelector("h1").innerText = subject + " (AI Mode)";
    backBtn.style.display = "block";

    await loadModels();
    startVideo();
  } catch (err) {
    console.error("Error selecting subject:", err);
  }
};

// Start webcam video
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      statusEl.innerText = "📷 Detecting mood...";
      detectEmotions();
    })
    .catch(err => {
      console.error("Camera error:", err);
      statusEl.innerText = "⚠️ Please allow camera access!";
    });
}

// Detect facial emotions
async function detectEmotions() {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector(".ai-section").append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 500);
}

// Back button to main subjects
window.goBack = function () {
  document.querySelector(".subjects").style.display = "flex";
  document.querySelector(".ai-section").style.display = "none";
  document.query
