import { useState, useRef, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaUserCircle } from 'react-icons/fa';

import { auth } from '../../Auth/Firebase.jsx'; // Adjust the import path to your Firebase config

const ProfileDropdown = ({ closeModalProject }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const dropdownMenuRef = useRef(null);
  const navigate = useNavigate(); 

  // Fetch user email on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        navigate('/login'); // Redirect to the login page after sign out
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  return (
    <div className="relative">
      {isDropdownOpen && (
        <div 
          ref={dropdownMenuRef} 
          className="absolute z-50 bottom-14 left-1  w-[11.2rem] font-serif h-[8.8rem] bg-white bg-blend-multiply border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="flex items-center p-2 border-b border-gray-300">
            <img 
              src="https://via.placeholder.com/40" 
              alt="Profile" 
              className="w-10 h-10 rounded-full" 
            />
            <span className="ml-2 text-black">{userEmail}</span>
          </div>
          <div className="">
            <Link href="#settings" className="block px-4  text-gray-700 hover:bg-gray-300">
              Settings
            </Link>
            
            <Link href="#subscription" className="block px-4  text-gray-700 hover:bg-gray-300">
              Subscription
            </Link>
            <Link href="#subscription" className="block px-4  text-gray-700 hover:bg-gray-300">
              Teams
            </Link>
            <a
              onClick={handleSignOut} 
              className="block w-full rounded-br-lg rounded-bl-lg mb-6 text-center items-baseline  text-white bg-purple-900 border border-purple-900  hover:bg-red-600 hover:border-red-600"
            >
              Sign Out
            </a>
          </div>
        </div>
      )}

      {/* Dropdown Button */}
      <button 
        onClick={toggleDropdown} 
        className="flex items-baseline px-5 py-2 mr-8 rounded-r-full w-24 duration-500 ease-in-out  cursor-progress bg-purple-950 text-white mb-4"
      >
        <FaUserCircle className="text-3xl" />
      </button>
    </div>
  );
};

export default ProfileDropdown;
