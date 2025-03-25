import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import formside from './../../popup/assets/formside.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
  setPersistence,
  browserSessionPersistence,
  signInWithCredential
} from 'firebase/auth';
import GoogleIcon from './../../popup/assets/google.svg';
import { motion } from 'framer-motion';
import heroimage from './assets/hero/hero-background.jpg';
import { IoArrowBack } from 'react-icons/io5';
import { authenticateWithChrome } from './../Auth/ChromeExtAuth';

const Loginform = () => {
  const [loading, setLoading] = useState(false);
  const [isExtensionContext, setIsExtensionContext] = useState(false);
  const [showGoogleError, setShowGoogleError] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const floatInFromLeft = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  // Check if we're in an extension context
  useEffect(() => {
    const checkContext = () => {
      return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    };
    setIsExtensionContext(checkContext());
    
    // Log extension ID for verification
    if (checkContext()) {
      console.log("Running in extension with ID:", chrome.runtime.id);
    }
    
    // Define an async function inside useEffect
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect result:', result.user);
          toast.success('Logged in with Google successfully!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        toast.error(`Redirect error: ${error.message}`);
      }
    };
    
    // Call the async function
    handleRedirectResult();
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when login starts

    try {
      const email = e.target.elements.email.value;
      const password = e.target.elements.password.value;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
      console.log(userCredential);

    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
        toast.error('Network request failed. Please check your internet connection.');
      } else {
        toast.error(`Error: ${error.message}`);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false); // Set loading to false after login completes
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setShowGoogleError(false);
    
    // Check if we're in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      try {
        // Log details for debugging
        console.log("Extension ID:", chrome.runtime.id);
        
        // Use our extension-specific authentication helper
        const userCredential = await authenticateWithChrome();
        console.log('Google login success:', userCredential.user);
        toast.success('Logged in with Google successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Chrome authentication error:', error);
        toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
        setShowGoogleError(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Non-extension environment logic
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Google login success:', result.user);
        toast.success('Logged in with Google successfully!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed');
        setShowGoogleError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => navigate('/')} className="text-white text-2xl">
          <IoArrowBack />
        </button>
      </div>
      <div className="relative w-full h-full" style={{ backgroundImage: `url(${heroimage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100vh' }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 w-screen h-full">
          <div className="hidden sm:block">
            <img src={formside} alt="Form side image" className="object-cover w-full h-full" />
          </div>
          <div className="flex items-center justify-center p-4 sm:p-8">
            <form className="relative w-full max-w-md mx-auto space-y-6" style={{ width: '700px', height: '100%' }} onSubmit={handleLogin}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={floatInFromLeft}
                transition={{ duration: 2 }}
                className="font-serif justify-center grid grid-cols-1 items-center text-center flex-col sm:px-4 md:px-8 lg:px-12 bg-cover bg-center"
              >
                <h2 className="font-bold text-2xl sm:text-3xl text-white text-center">
                  Welcome to Sprinty
                </h2>
              </motion.div>
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-base block mb-1 bg-gradient-to-r from-white to-purple-600 text-transparent bg-clip-text">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    name="email"
                    placeholder="Enter email"
                    required
                    disabled={loading} // Disable input during loading
                  />
                </div>
                <div>
                  <label className="font-bold text-base block mb-1 bg-gradient-to-r from-white to-purple-600 text-transparent bg-clip-text">Password</label>
                  <input
                    type="password"
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    name="password"
                    placeholder="Enter password"
                    required
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="py-2 px-4 bg-purple-900 hover:bg-purple-950 focus:ring-purple-900 text-white w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  type="submit"
                  disabled={loading} // Disable button during loading
                >
                  {loading ? 'Logging in...' : 'Log in'} {/* Show loading text */}
                </button>
              </div>
              <div className="mt-4">
                <button
                  className="flex items-center justify-center py-2 px-4 bg-gray-200 hover:bg-gray-300 text-black w-full transition ease-in duration-200 text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading} // Disable button during loading
                >
                  {loading ? 'Please wait...' : (
                    <>
                      <img src={GoogleIcon} alt="Google icon" className="w-5 h-5" />
                      <span className="ml-2">Log in with Google</span>
                    </>
                  )}
                </button>
              </div>
              {showGoogleError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-red-700 font-semibold">Google Login Not Working?</h3>
                  <p className="text-sm text-red-600 mt-1">Chrome extensions have limitations with Google authentication:</p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-red-600">
                    <li>Please use email/password login instead</li>
                    <li>If you don't have an account, please create one</li>
                    <li>Google login may work in the web version of this app</li>
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Loginform;
