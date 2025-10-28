// Wait for the DOM to load first
window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const statusEl = document.getElementById("status");
  const backBtn = document.getElementById("backBtn");

  // Hide back button initially
  backBtn.style.display = "none";

  // Load all face-api models
  async function loadModels() {
    try {
      statusEl.innerText = "Loading AI models...";
      await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
      await faceapi.nets.faceExpressionNet.loadFromUri("./models");
      await faceapi.nets.ageGenderNet.loadFromUri("./models");
      statusEl.innerText = "Models loaded! Starting camera...";
      startVideo();
    } catch (err) {
      console.error("Error loading models:", err);
      statusEl.innerText = "❌ Error loading AI models.";
    }
  }

  // Start webcam video
  function startVideo() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        statusEl.innerText = "Camera active. Detecting emotions...";
      })
      .catch((err) => {
        console.error("Camera access denied:", err);
        statusEl.innerText = "Please allow camera access.";
      });
  }

  // Detect emotions continuously
  video.addEventListener("playing", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector(".ai-section").append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()
        .withAgeAndGender();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      if (detections.length > 0) {
        const expression = detections[0].expressions;
        const topEmotion = Object.keys(expression).reduce((a, b) =>
          expression[a] > expression[b] ? a : b
        );
        speakEmotion(topEmotion);
      }
    }, 4000);
  });

  // Speak emotion result
  function speakEmotion(emotion) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance();
    utter.text = `You look ${emotion}. Let's continue learning!`;
    utter.pitch = 1;
    utter.rate = 1;
    synth.speak(utter);
  }

  // When a subject is selected
  window.selectSubject = function (subject) {
    document.querySelector("h1").innerText = subject;
    document.querySelector(".subjects").style.display = "none";
    document.querySelector(".ai-section").style.display = "flex";
    backBtn.style.display = "block";
    loadModels();
  };

  // Go back to main screen
  window.goBack = function () {
    document.querySelector(".subjects").style.display = "flex";
    document.querySelector(".ai-section").style.display = "none";
    backBtn.style.display = "none";
    document.querySelector("h1").innerText = "AI Emotion–Based Tutor";
    statusEl.innerText = "";
  };
});
