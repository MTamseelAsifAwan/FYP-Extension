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
  signInWithCredential,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
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
  const [isGoogleOnlyAccount, setIsGoogleOnlyAccount] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [manualResetEmail, setManualResetEmail] = useState('');
  const [showManualReset, setShowManualReset] = useState(false);
  const [hasResetPassword, setHasResetPassword] = useState(false);
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState('');
  const [webAppUrl, setWebAppUrl] = useState('https://sprinty-app.web.app'); // Update this URL to your actual webapp URL
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

  // Add this function to log Firebase project info
  useEffect(() => {
    // Log Firebase config details for troubleshooting
    try {
      const app = auth.app;
      console.log("Firebase App name:", app.name);
      console.log("Firebase options:", app.options);
      // This will help verify we're connecting to the correct Firebase project
    } catch (error) {
      console.error("Error logging Firebase config:", error);
    }
  }, [auth]);

  // Add this useEffect to check if user has previously reset password
  useEffect(() => {
    const resetEmails = JSON.parse(localStorage.getItem('passwordResetEmails') || '[]');
    if (resetEmails.length > 0) {
      console.log("Previously reset emails:", resetEmails);
    }
  }, []);

  const handleEmailChange = (e) => {
    setEnteredEmail(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when login starts
    setIsGoogleOnlyAccount(false);
    setShowManualReset(false);
    
    try {
      const email = e.target.elements.email.value.toLowerCase();
      setEnteredEmail(email); // Store the email for potential manual reset
      const password = e.target.elements.password.value;

      // Check if this email has previously reset password
      const resetEmails = JSON.parse(localStorage.getItem('passwordResetEmails') || '[]');
      const hasReset = resetEmails.includes(email);
      
      // Try login first regardless of previous reset status
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login successful!');
        navigate('/dashboard');
        console.log(userCredential);
        return; // Exit early on successful login
      } catch (loginError) {
        console.error('Login error:', loginError);
        console.error('Login error code:', loginError.code);
        
        // Show additional options after a failed login attempt
        setShowAdditionalOptions(true);
        
        // If this is a previously reset email and we get invalid-credential,
        // it might be a wrong password rather than Google-only account
        if (hasReset && (loginError.code === 'auth/wrong-password' || 
                         loginError.code === 'auth/invalid-credential')) {
          toast.error('Invalid password. Please try again or reset your password.');
          setManualResetEmail(email);
          setShowManualReset(true);
          setLoading(false);
          return;
        }
        
        // Continue with auth method checking if not a simple wrong password
        try {
          console.log("Checking sign-in methods for:", email);
          // Check if this email exists with other sign-in methods
          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log('Sign-in methods for email:', methods);
          
          if (methods && methods.length > 0) {
            if (methods.includes('google.com') && !methods.includes('password')) {
              // This is a Google-only account
              setIsGoogleOnlyAccount(true);
              setGoogleEmail(email);
              toast.info('This account was created with Google. Please use the reset password option below.');
            } else if (methods.includes('password')) {
              // Password auth is available but login failed - likely wrong password
              toast.error('Invalid password. Please try again.');
            } else {
              toast.error(`Login failed: ${loginError.message}`);
              setShowManualReset(true);
            }
          } else {
            // No methods found for this email
            toast.error('No account found with this email address.');
            setShowManualReset(true);
          }
        } catch (methodError) {
          console.error('Method check error:', methodError);
          console.error('Method check error code:', methodError.code);
          toast.error(`Error checking account: ${methodError.message}`);
          setShowManualReset(true);
        }
      }
    } catch (error) {
      console.error('Outer error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Set loading to false after login completes
    }
  };

  const sendPasswordReset = async (email = googleEmail) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setPasswordResetSent(true);
      
      // Store email in localStorage to remember it's been reset
      const resetEmails = JSON.parse(localStorage.getItem('passwordResetEmails') || '[]');
      if (!resetEmails.includes(email.toLowerCase())) {
        resetEmails.push(email.toLowerCase());
        localStorage.setItem('passwordResetEmails', JSON.stringify(resetEmails));
      }
      
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error(`Failed to send password reset: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendManualPasswordReset = () => {
    sendPasswordReset(manualResetEmail);
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

  const handleGoogleAccountDeclaration = () => {
    if (enteredEmail) {
      setIsGoogleOnlyAccount(true);
      setGoogleEmail(enteredEmail);
      toast.info('Please use the password reset option to set up password login.');
    } else {
      toast.error('Please enter your email address first.');
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <button onClick={() => navigate('/')} className="text-white text-2xl">
          <IoArrowBack />
        </button>
      </div>
      <div className="relative w-full h-full" style={{ backgroundImage: `url(${heroimage})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '756px' }}>
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
              
              {/* New Google Account Information Message */}
              <div className="p-1 bg-indigo-50 border border-indigo-200 rounded-lg ">
                <h3 className="text-indigo-700 font-semibold">Google Account Users</h3>
                <ul className="list-disc  text-xs text-indigo-600">
                  Enter the same email address you used for Google login on webapp,Click "Log in" to get password reset options
                </ul>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-base block  bg-gradient-to-r from-white to-purple-600 text-transparent bg-clip-text">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    name="email"
                    placeholder="Enter email"
                    required
                    disabled={loading} // Disable input during loading
                    onChange={handleEmailChange}
                  />
                </div>
                <div>
                  <label className="font-bold text-base block  bg-gradient-to-r from-white to-purple-600 text-transparent bg-clip-text">Password</label>
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
              
            
              
              {isGoogleOnlyAccount && !passwordResetSent && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-blue-700 font-semibold">Google Account Detected</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    This email ({googleEmail}) was previously used with Google Sign-In. 
                    To use email/password login in this extension:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-blue-600">
                    <li>Click the button below to request a password reset</li>
                    <li>Once you've set a password, you can log in with email/password</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => sendPasswordReset()}
                    disabled={loading}
                    className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition ease-in duration-200 text-sm font-semibold"
                  >
                    {loading ? "Processing..." : "Send Password Reset Email"}
                  </button>
                </div>
              )}
              
              {showManualReset && !passwordResetSent && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="text-yellow-700 font-semibold">Account Detection Issue</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    We're having trouble detecting your account properly 
                    you can manually request a password reset email:
                  </p>
                  <button
                    type="button"
                    onClick={sendManualPasswordReset}
                    disabled={loading}
                    className="mt-3 w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition ease-in duration-200 text-sm font-semibold"
                  >
                    {loading ? "Processing..." : `Reset Password for ${manualResetEmail}`}
                  </button>
                </div>
              )}
              
              {passwordResetSent && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-green-700 font-semibold">Password Reset Email Sent</h3>
                  <p className="text-sm text-green-600 mt-1">
                    We've sent a password reset link to {googleEmail}. Please check your inbox and spam folder.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    After setting your password, you can return to log in with your email and new password.
                  </p>
                </div>
              )}
              
             
              
              {showGoogleError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 mt-1">Chrome extensions have limitations with Google authentication:</p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-red-600">
                    <li>Please use email/password login instead/Reset it</li>
             
                  </ul>
                </div>
              )}
              
              {/* New Sign Up Button */}
              <div className="mt-1 text-center">
                <a 
                  href={webAppUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition ease-in duration-200 text-base font-semibold shadow-md"
                >
                  Sign Up on Web App
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Loginform;
