import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';

// ThemeSwitcher component to toggle between light and dark themes
const ThemeSwitcher = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false); // State to track the current theme
  const buttonRef = useRef(null); // Reference to the button for removing focus

  // UseEffect hook to set the theme based on stored preference on initial render
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme'); // Retrieve stored theme from localStorage
    if (storedTheme === 'dark') {
      applyDarkTheme(); // Apply dark theme if stored preference is dark
    } else {
      applyLightTheme(); // Apply light theme by default
    }
  }, []);

  // Function to apply dark theme
  const applyDarkTheme = () => {
    document.getElementById('theme-link').href = '/themes/viva-dark/theme.css'; // Set dark theme CSS
    localStorage.setItem('theme', 'dark'); // Store theme preference in localStorage
    setIsDarkTheme(true); // Update state to dark theme
    buttonRef.current.blur(); // Remove focus from the button
  };

  // Function to apply light theme
  const applyLightTheme = () => {
    document.getElementById('theme-link').href = '/themes/viva-light/theme.css'; // Set light theme CSS
    localStorage.setItem('theme', 'light'); // Store theme preference in localStorage
    setIsDarkTheme(false); // Update state to light theme
    buttonRef.current.blur(); // Remove focus from the button
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    if (isDarkTheme) {
      applyLightTheme(); // Switch to light theme if currently dark
    } else {
      applyDarkTheme(); // Switch to dark theme if currently light
    }
  };

  return (
    <Button
      ref={buttonRef} // Attach button reference
      icon={isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'} // Set icon based on the current theme
      className="p-button-icon-only theme-switcher" // Set button class
      onClick={toggleTheme} // Toggle theme on button click
    />
  );
};

export default ThemeSwitcher;
