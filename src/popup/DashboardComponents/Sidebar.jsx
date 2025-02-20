import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './../../popup/assets/logo1-unscreen.gif';
import { auth } from '../.././popup/Auth/Firebase.jsx'; // Adjust the import path to your Firebase config
import { signOut, onAuthStateChanged } from 'firebase/auth';

const Sidebar = ({ onSelect, activeSection }) => {
  const navigate = useNavigate();
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
    
    <div
      className="sidebar relative  border shadow bg-opacity-50 backdrop-blur-lg  rounded-t-xl rounded-b-xl ml-1 mr-1   mt-6 text-white    gap-1 flex flex-col justify-between"
      style={{ width: '170px', height: '93vh' }} 
    >
         <div className='mt-[-3.7rem]'>
            <img src={Logo} alt="Logo" width={180} height={100} />
          </div>
      <ul className="space-y-2 mt-[-15rem] text-white font-serif font-semibold">
        
        <li
          onClick={() => onSelect('dashboard')}
          className={`flex items-baseline border space-x-2 px-5 mr-8 rounded-r-full duration-500 ease-in-out py-4 cursor-pointer ${
            activeSection === 'dashboard'
              ? 'bg-purple-900 text-white'
              : 'hover:bg-slate-200 hover:text-purple-700'
          }`}
        >
          Dashboard
        </li>
        {/* <li
          onClick={() => onSelect('chatroom')}
          className={`flex items-baseline border  space-x-2 px-5 mr-8 rounded-r-full duration-500 ease-in-out py-4 cursor-pointer ${
            activeSection === 'teams'
              ? 'bg-purple-900 text-white'
              : 'hover:bg-slate-200 hover:text-purple-950'
          }`}
        >
                    Chatroom

        </li> */}
       
        <li
          onClick={() => onSelect('taks-report')}
          className={`flex items-baseline border  space-x-2 px-5 mr-8 rounded-r-full duration-500 ease-in-out py-4 cursor-pointer ${
            activeSection === 'taks-report'
              ? 'bg-purple-900 text-white'
              : 'hover:bg-slate-200 hover:text-purple-950'
          }`}
        >
          Tasks
        </li>
        <li
          onClick={() => onSelect('reports')}
          className={`flex items-baseline border  space-x-2 px-5 mr-8 rounded-r-full duration-500 ease-in-out py-4 cursor-pointer ${
            activeSection === 'reports'
              ? 'bg-purple-900 text-white'
              : 'hover:bg-slate-200 hover:text-purple-950'
          }`}
        >
          Reports
        </li>
        <li
          onClick={() => onSelect('setting')}
          className={`flex items-baseline border  space-x-2 px-5 mr-8 rounded-r-full duration-500 ease-in-out py-4 cursor-pointer ${
            activeSection === 'chatroom'
              ? 'bg-purple-900 text-white'
              : 'hover:bg-slate-200 hover:text-purple-950'
          }`}
        >
          Setting
        </li>


        {/* Add more items as needed */}
      </ul>

      {/* ProfileDropdown with active styling */}
      <li className=" list-none bg-red-700 rounded-r-3xl p-2 mb-3 w-24 cursor-pointer hover:bg-red-600 text-center font-serif  text-lg" 
                    onClick={handleSignOut} 
>
        Signout
</li>

    </div>
  );
};

export default Sidebar;
