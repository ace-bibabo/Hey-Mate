import React, { useEffect, useState } from 'react';
import './css/LoadingMessage.css';

// Array of loading texts to be displayed in sequence
const loadingTexts = [
  "Analysing...",
  "Reading your message...",
  "Generating response...",
  "Processing data..."
];

const LoadingMessage = () => {
  const [currentText, setCurrentText] = useState(0); // State to keep track of the current loading text index
  const [isFading, setIsFading] = useState(false); // State to handle fading effect

  useEffect(() => {
    // Set interval to change the loading text every 5 seconds
    const interval = setInterval(() => {
      setIsFading(true); // Start fading effect
      setTimeout(() => {
        // Update the current text index
        setCurrentText((prevText) => (prevText + 1) % loadingTexts.length);
        setIsFading(false); // End fading effect
      }, 500); // Delay to synchronize with the CSS transition duration
    }, 5000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-message ${isFading ? 'fading' : ''}`}>
      <span>{loadingTexts[currentText]}</span>
    </div>
  );
};

export default LoadingMessage;
