import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formside from './../../popup/assets/formside.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from './../../popup/assets/google.svg'; // Example path
import { motion } from 'framer-motion';
import heroimage from './assets/hero/hero-background.jpg';
import { IoArrowBack } from 'react-icons/io5';

const Loginform = () => {
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const auth = getAuth();
  const floatInFromLeft = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

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
    const provider = new GoogleAuthProvider();
    setLoading(true); // Set loading to true when login starts

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google user:', user);

      toast.success('Logged in with Google successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    } finally {
      setLoading(false); // Set loading to false after login completes
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
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Loginform;
