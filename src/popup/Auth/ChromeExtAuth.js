import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth } from './Firebase';

// Main function to authenticate with Chrome - this is the one that needs to be exported
export const authenticateWithChrome = () => {
  return new Promise((resolve, reject) => {
    // First try message-based communication with background script
    chrome.runtime.sendMessage({ action: "getAuthToken" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error communicating with background script:", chrome.runtime.lastError);
        // Fall back to direct token retrieval
        getTokenDirectly(resolve, reject);
        return;
      }
      
      if (response && response.success && response.token) {
        try {
          const credential = GoogleAuthProvider.credential(null, response.token);
          const userCredential = await signInWithCredential(auth, credential);
          resolve(userCredential);
        } catch (error) {
          console.error("Error with credential:", error);
          reject(error);
        }
      } else {
        // Fall back to direct token retrieval
        getTokenDirectly(resolve, reject);
      }
    });
  });
};

// Function to get token directly (fallback)
const getTokenDirectly = (resolve, reject) => {
  try {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      if (token) {
        try {
          const credential = GoogleAuthProvider.credential(null, token);
          const userCredential = await signInWithCredential(auth, credential);
          resolve(userCredential);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("Failed to obtain token"));
      }
    });
  } catch (error) {
    reject(error);
  }
};

// Helper function to check if Chrome Identity API is available
export const isIdentityApiAvailable = () => {
  return typeof chrome !== 'undefined' && chrome.identity;
};
