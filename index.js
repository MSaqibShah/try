const fs = require("fs");
const wav = require("node-wav");

const inputWav = "test.wav";
const outputDir = "output";
const sampleRate = 8000;
const MIN_DURATION_SECONDS = 0.5;

// let threshold = 0.05;
let threshold = 0.04772;

// Create output folder if not exists
if (!fs.existsSync(outputDir)) {
  if (fs.existsSync(outputDir)) {
    // delete folder
    fs.rmdirSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir);
}

function saveAudio(filename, data, sampleRate) {
  const wavData = wav.encode([data], {
    sampleRate,
    float: false,
    bitDepth: 16,
  });
  fs.writeFileSync(filename, wavData);
}

function findSilenceIntervals(data, silenceThreshold = 0.0001) {
  const intervals = [];
  let currentInterval = null;

  for (let i = 0; i < data.length; i++) {
    const amplitude = Math.abs(data[i]);

    if (amplitude < silenceThreshold) {
      // Start of silence
      if (currentInterval === null) {
        currentInterval = { start: i, end: null };
      }
    } else {
      // End of silence
      if (currentInterval !== null) {
        currentInterval.end = i;
        intervals.push({ ...currentInterval });
        currentInterval = null;
      }
    }
  }

  // If the last interval ends with silence
  if (currentInterval !== null) {
    currentInterval.end = data.length;
    intervals.push({ ...currentInterval });
  }

  return intervals;
}

// Load the audio and find intervals of silence
const inputBuffer = fs.readFileSync(inputWav);
const { channelData, sampleRate: originalSampleRate } = wav.decode(inputBuffer);

// Process only the first channel (mono audio)
const monoData = channelData[0];

function findABS20thSmallestValue(data) {
  const sortedData = data.slice().sort((a, b) => a - b);

  // take 20th absolute value
  const twentiethSmallest = Math.abs(data[19]);
  return twentiethSmallest;
}

threshold = findABS20thSmallestValue(monoData);

const intervals = findSilenceIntervals(monoData, threshold);

// Iterate through each interval and save as a separate word
intervals.forEach((interval, i) => {
  const { start, end } = interval;

  // Extract the word segment
  const wordSegment = monoData.slice(start, end);

  // Check the duration of the word segment
  const durationSeconds = wordSegment.length / originalSampleRate;

  // Save the word segment only if the duration is at least one second
  if (durationSeconds >= MIN_DURATION_SECONDS) {
    const filename = `${outputDir}/export_${String(i).padStart(
      10,
      "0"
    )}_${start}_${end}.wav`;

    // Save the word segment without resampling
    saveAudio(filename, wordSegment, originalSampleRate);

    // Record information
    console.log(`Saved: ${filename}`);
  } else {
    // console.log(
    //   `Skipped: Word segment at ${start}-${end} is less than ${MIN_DURATION_SECONDS} second.`
    // );
  }
});
