let currentSubject = "";

// 🎙️ Voice function that adapts tone based on emotion
function speak(text, emotion = "neutral") {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Adjust tone, pitch, and speed based on emotion
  switch (emotion) {
    case "happy":
      utterance.pitch = 1.4;
      utterance.rate = 1.2;
      break;
    case "sad":
      utterance.pitch = 0.7;
      utterance.rate = 0.9;
      break;
    case "angry":
      utterance.pitch = 0.9;
      utterance.rate = 1.1;
      break;
    case "surprised":
      utterance.pitch = 1.3;
      utterance.rate = 1.3;
      break;
    default:
      utterance.pitch = 1;
      utterance.rate = 1;
  }

  utterance.lang = "en-US";
  synth.cancel();
  synth.speak(utterance);
}

// 🎓 Subject selection and webcam start
async function selectSubject(subject) {
  currentSubject = subject;
  document.getElementById("subjectSelection").style.display = "none";
  document.getElementById("learningSection").style.display = "block";

  const subjectTitle = document.getElementById("subjectTitle");
  const lessonText = document.getElementById("lessonText");
  const feedback = document.getElementById("feedback");
  const video = document.getElementById("video");

  // Choose subject lesson
  switch (subject) {
    case "os":
      subjectTitle.innerText = "Operating Systems (OS)";
      lessonText.innerText =
        "An Operating System manages hardware, software, and system resources.";
      speak(
        "Welcome to Operating Systems! Let's explore how your computer manages everything.",
        "happy"
      );
      break;
    case "adsa":
      subjectTitle.innerText = "Advanced Data Structures & Algorithms (ADSA)";
      lessonText.innerText =
        "ADSA focuses on efficient ways to store and manipulate data using algorithms.";
      speak(
        "Welcome to Advanced Data Structures and Algorithms. Let's make data dance!",
        "happy"
      );
      break;
    case "java":
      subjectTitle.innerText = "Java Programming";
      lessonText.innerText =
        "Java is an object-oriented language for building secure and scalable software.";
      speak("Welcome to Java Programming. Let's code some magic!", "happy");
      break;
  }

  feedback.innerHTML = "Loading AI models...";

  // ✅ Load models from the current folder (.)
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("."),
    faceapi.nets.faceExpressionNet.loadFromUri("."),
  ]);

  // 🎥 Access webcam
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
      feedback.innerHTML = "Analyzing emotions...";
    })
    .catch((err) => {
      feedback.innerHTML = "Camera access denied or unavailable.";
      console.error("Camera error:", err);
    });

  // 🎯 Start emotion detection
  video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // 🧠 Debug overlay for detected emotion
    const debug = document.createElement("div");
    debug.id = "debugOverlay";
    debug.style.position = "fixed";
    debug.style.top = "20px";
    debug.style.right = "20px";
    debug.style.background = "rgba(0,0,0,0.6)";
    debug.style.color = "white";
    debug.style.padding = "10px 15px";
    debug.style.borderRadius = "10px";
    debug.style.fontFamily = "monospace";
    debug.style.zIndex = 9999;
    debug.innerText = "Detecting emotion...";
    document.body.append(debug);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(
        detections,
        displaySize
      );
      canvas
        .getContext("2d")
        .clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      if (detections.length > 0) {
        const emotions = detections[0].expressions;
        const topEmotion = Object.keys(emotions).reduce((a, b) =>
          emotions[a] > emotions[b] ? a : b
        );

        debug.innerText = `😊 Emotion: ${topEmotion.toUpperCase()} (${(
          emotions[topEmotion] * 100
        ).toFixed(1)}%)`;

        adaptLesson(topEmotion);
      } else {
        debug.innerText = "No face detected 😐";
      }
    }, 1500);
  });
}

// 🎯 Update feedback and voice response based on detected emotion
function adaptLesson(emotion) {
  const feedback = document.getElementById("feedback");
  const lessonText = document.getElementById("lessonText");

  const reactions = {
    happy: "You look happy! Let's keep up this great energy!",
    neutral: "Stay focused — you're doing great.",
    sad: "Seems like you’re feeling a bit down. Let's make it simpler.",
    surprised: "You look curious! Let's explore more together.",
    angry: "Take a deep breath — we’ll go through this step by step.",
  };

  const message = reactions[emotion] || "Keep learning — you're doing awesome!";
  feedback.innerText = message;
  speak(message, emotion);

  if (emotion === "sad" || emotion === "angry") {
    if (currentSubject === "os")
      lessonText.innerText =
        "Think of an OS like your computer's manager — it simplifies everything for you.";
    else if (currentSubject === "adsa")
      lessonText.innerText =
        "Algorithms are just recipes for data — let's make it fun!";
    else if (currentSubject === "java")
      lessonText.innerText =
        "In Java, start small with variables and loops before big projects.";
  }
}

// 🌀 Return to main menu
function goBack() {
  document.getElementById("subjectSelection").style.display = "block";
  document.getElementById("learningSection").style.display = "none";
  window.speechSynthesis.cancel();
  const debug = document.getElementById("debugOverlay");
  if (debug) debug.remove();
}
