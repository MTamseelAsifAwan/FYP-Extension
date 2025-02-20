import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshakeAngle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getDatabase, ref, set, get } from 'firebase/database'; // Import Firebase functions
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PulseLoader } from 'react-spinners'; // Import a spinner

const Setting = () => {
  // State to store form inputs
  const [email, setEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSaving, setIsSaving] = useState(false); // Track if data is being saved
  const [accessTokenAvailable, setAccessTokenAvailable] = useState(null); // Track if accessToken is available

  // Function to check if accessToken is already present in Firebase
  const checkAccessTokenAvailability = () => {
    const db = getDatabase();
    const userRef = ref(db, 'users/Accesstokendata');

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setAccessTokenAvailable(true);
        } else {
          setAccessTokenAvailable(false);
        }
      })
      .catch((error) => {
        console.error('Error checking access token availability:', error);
      });
  };

  // Check if access token is available when the component mounts
  React.useEffect(() => {
    checkAccessTokenAvailability();
  }, []);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true); // Start the saving process

    // Save data to Firebase Realtime Database
    const db = getDatabase();
    const userRef = ref(db, 'users/Accesstokendata');

    set(userRef, {
      email: email,
      accessToken: accessToken,
    })
      .then(() => {
        toast.success('Data saved successfully!');
        setEmail(''); // Clear input fields after saving
        setAccessToken('');
        checkAccessTokenAvailability(); // Check access token availability again
      })
      .catch((error) => {
        toast.error('Error saving data:', error);
        console.error('Error saving data:', error);
      })
      .finally(() => {
        setIsSaving(false); // Stop the saving process
      });
  };

  return (
    <>
      <div className="text-3xl text-white font-bold mt-2 ml-1 mb-4">Setting</div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-4">
          <div>
            <h3 className="text-white text-center">Enter your Jira Email and Access Token</h3>
            <div className="flex items-center text-center pt-2">
              <FontAwesomeIcon className="text-yellow-400 rounded-full text-lg mr-2" icon={faHandshakeAngle} />
              <p className="text-gray-300">
                Go to your <a href="https://www.atlassian.com/software/jira" target="_blank" className="text-blue-500 underline">Jira</a> account and generate an access token. <br />
                By tapping on manage account and then security.
              </p>
            </div>
          </div>

          {/* Box on top right corner to show access token availability */}
          <div className="absolute top-0 right-0 mr-4 mt-2">
            {accessTokenAvailable === null ? (
              <span>Checking...</span>
            ) : accessTokenAvailable ? (
                <div className='flex justify-end items-end'>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" title="Access Token Available" />
              <p className='text-white text-sm'>
                                Token Available

              </p>
              </div>
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="text-red-500" title="Access Token Not Available" />
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-white font-semibold">Email</label>
            <input
              type="email"
              className="bg-white rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state when input changes
              required
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-white font-semibold">Access Token</label>
            <input
              type="password"
              className="bg-white rounded-lg p-2"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)} // Update state when input changes
              required
            />
          </div>

          {/* Button with loader */}
          <button className="bg-purple-900 text-white rounded-lg p-2 hover:bg-purple-950 flex items-center justify-center" type="submit" disabled={isSaving}>
            {isSaving ? <PulseLoader size={8} color="white" /> : 'Update'}
          </button>
        </div>

        <ToastContainer /> {/* Toast notifications will appear here */}
      </form>
    </>
  );
};

export default Setting;
