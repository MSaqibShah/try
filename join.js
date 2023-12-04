const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// Function to join WAV files
function joinWavFiles(directory, outputFile) {
  // Read all files in the specified directory
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Filter only WAV files
    const wavFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".wav"
    );

    // Build the full paths for WAV files
    const inputFiles = wavFiles.map((file) => path.join(directory, file));

    if (inputFiles.length === 0) {
      console.log("No WAV files found in the specified directory.");
      return;
    }

    // Join the WAV files
    joinWavFilesInternal(inputFiles, outputFile);
  });
}

// Function to join WAV files
function joinWavFilesInternal(inputFiles, outputFile) {
  const command = ffmpeg();

  inputFiles.forEach((inputFile) => {
    command.input(inputFile);
  });

  command
    .on("error", (err) => {
      console.error("Error:", err);
    })
    .on("end", () => {
      console.log("Joining complete");
    })
    .mergeToFile(outputFile, __dirname);
}

// Specify the directory containing WAV files and the output file
const inputDirectory = "output";
const outputFilePath = "output.wav";

// Join the WAV files in the specified directory
joinWavFiles(inputDirectory, outputFilePath);
