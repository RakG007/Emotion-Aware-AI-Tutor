// script.js — Fixed for GitHub Pages path

const video = document.getElementById("video");
const subjectTitle = document.getElementById("subject-title");
const subjectDesc = document.getElementById("subject-desc");

// ✅ Correct model path for GitHub Pages
const MODEL_URL = "/Emotion-Aware-AI-Tutor/models";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
])
  .then(startVideo)
  .catch(err => {
    console.error("Error loading models:", err);
    document.querySelector(".status").innerText = "Error loading AI models.";
  });

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      document.querySelector(".status").innerText = "Camera started. Detecting...";
    })
    .catch(err => {
      console.error("Camera error:", err);
      document.querySelector(".status").innerText = "Camera access denied.";
    });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

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

    if (detections[0]) {
      const { age, gender, expressions } = detections[0];
      const mood = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      updateTutorResponse(mood);
    }
  }, 1000);
});

function updateTutorResponse(mood) {
  const status = document.querySelector(".status");
  switch (mood) {
    case "happy":
      status.innerText = "You look happy 😄 — let's keep learning!";
      break;
    case "sad":
      status.innerText = "Feeling down? Don’t worry, we’ll take it easy.";
      break;
    case "angry":
      status.innerText = "Looks like some frustration — want to try a simpler topic?";
      break;
    case "surprised":
      status.innerText = "Surprised? Let’s explore something new!";
      break;
    default:
      status.innerText = `Mood detected: ${mood}`;
  }
}
