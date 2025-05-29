/**
 * Component that dynamically changes the favicon based on the system's color scheme
 */

import React, { useEffect } from 'react';

const DynamicFavicon: React.FC = () => {
  useEffect(() => {
    // Function to update favicon based on color scheme
    const updateFavicon = (isDarkMode: boolean) => {
      const faviconLink = document.querySelector("link[rel='icon']") ||
        document.querySelector("link[rel='shortcut icon']");

      if (faviconLink instanceof HTMLLinkElement) {
        // Update existing favicon
        faviconLink.href = isDarkMode ? '/dark favicon.ico' : '/favicon.ico';
      } else {
        // Create new favicon link if none exists
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = isDarkMode ? '/dark favicon.ico' : '/favicon.ico';
        document.head.appendChild(newFavicon);
      }
    };

    // Check if dark mode is preferred
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial favicon
    updateFavicon(darkModeMediaQuery.matches);

    // Add listener for color scheme changes
    const handleChange = (e: MediaQueryListEvent) => {
      updateFavicon(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default DynamicFavicon; 