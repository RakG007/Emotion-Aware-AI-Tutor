let currentSubject = "";

async function selectSubject(subject) {
  currentSubject = subject;
  document.getElementById('subjectSelection').style.display = 'none';
  document.getElementById('learningSection').style.display = 'block';

  const subjectTitle = document.getElementById('subjectTitle');
  const lessonText = document.getElementById('lessonText');
  const feedback = document.getElementById('feedback');
  const video = document.getElementById('video');

  // Set initial content based on chosen subject
  switch (subject) {
    case 'os':
      subjectTitle.innerText = "Operating Systems (OS)";
      lessonText.innerText = "An Operating System manages hardware, software, and system resources. It acts as an interface between user and machine.";
      break;
    case 'adsa':
      subjectTitle.innerText = "Advanced Data Structures & Algorithms (ADSA)";
      lessonText.innerText = "ADSA focuses on efficient ways to store, process, and manipulate data using algorithms and abstract structures.";
      break;
    case 'java':
      subjectTitle.innerText = "Java Programming";
      lessonText.innerText = "Java is an object-oriented programming language that enables secure, portable, and scalable software development.";
      break;
  }

  // Load models for face detection
  feedback.innerHTML = "Loading AI models...";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]);

  // Start webcam
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => { video.srcObject = stream; feedback.innerHTML = "Analyzing emotions..."; });

  // Listen and adapt responses
  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      if (detections.length > 0) {
        const emotions = detections[0].expressions;
        const topEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
        
        adaptLesson(topEmotion);
      }
    }, 1000);
  });
}

function adaptLesson(emotion) {
  const feedback = document.getElementById('feedback');
  const lessonText = document.getElementById('lessonText');

  const reactions = {
    happy: "😊 You look interested! Let's dive deeper into this topic.",
    neutral: "🙂 Stay focused — learning is going well.",
    sad: "😔 Seems like you’re feeling low. Let’s simplify the topic.",
    surprised: "😮 Curious? That’s the spark of learning!",
    angry: "😡 Don’t worry, take a short break and return refreshed."
  };

  feedback.innerText = reactions[emotion] || "Keep learning, you’re doing great!";

  // Change content slightly based on emotion
  if (emotion === "sad" || emotion === "angry") {
    if (currentSubject === "os")
      lessonText.innerText = "OS manages your computer — think of it like a traffic controller simplifying your tasks.";
    else if (currentSubject === "adsa")
      lessonText.innerText = "Algorithms are just step-by-step instructions — like cooking recipes for data!";
    else if (currentSubject === "java")
      lessonText.innerText = "In Java, start simple: variables, loops, and conditions — then move to OOP.";
  }
}

function goBack() {
  document.getElementById('subjectSelection').style.display = 'block';
  document.getElementById('learningSection').style.display = 'none';
}
