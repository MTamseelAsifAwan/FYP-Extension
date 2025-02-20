import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { IoMenu, IoClose } from 'react-icons/io5';
import Logo from '../../assets/logo1-unscreen.gif';
import Profiledropdown from './Profiledeopdown';
const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const onToggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log('Menu toggled', menuOpen);
  };

 
  return (
    <div className='bg-white shadow-boxy3 font-serif'>
      <header className="bg-white">
        <nav className="flex justify-between items-center h-1  w-[92%] mx-auto font-serif">
          
         </nav>
         </header>
    </div>
  );
}

export default HomeNavbar;
