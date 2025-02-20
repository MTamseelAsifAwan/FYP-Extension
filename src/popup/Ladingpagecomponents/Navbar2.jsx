import { useState } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';
import Logo from './../assets/logo1-unscreen.gif'; 
import { useNavigate } from 'react-router-dom';

const Navbar2 = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const onToggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log('Menu toggled', menuOpen);
  };
  const handleSignUp = () => {
    navigate('/signup');
  };
  const handleLogin = () => {
    navigate('/login');
  };
  const handleHome = () => {
   navigate('/');
  };

  return (
    <div className='bg-white shadow-boxy3 font-serif fixed top-0 left-0 right-0 z-50'>
      <header className="bg-white">
        <nav className="flex justify-between items-center h-16 w-full max-w-screen-xl mx-auto font-serif px-4">
          <div className='flex items-center'>
            <img src={Logo} alt="Logo" width={50} height={50} />
          </div>
          <div className="flex items-center justify-center flex-1">
            <button className="border border-purple-900 rounded-md text-white bg-purple-900 font-serif hover:font-bold hover:bg-purple-950 hover:text-white px-4 py-1" onClick={handleHome}>Home</button>
          </div>
          <div
            className={`nav-links duration-500 md:static absolute bg-white md:min-h-fit min-h-[60vh] left-0 ${menuOpen ? 'top-[6%]' : 'top-[-100%]'} md:w-auto w-full flex items-center px-5`}
          >
            <ul className="flex items-center justify-center ml-14 md:flex-row flex-col md:items-center md:gap-[4vw] sm:items-center gap-8">
              <li>
                <a className="li-items font-serifc cursor-pointer " onClick={handleHome}>Home</a>
              </li>
             
            </ul>
          </div>
          <div className="flex items-center gap-4">
            {menuOpen ? (
              <IoClose onClick={onToggleMenu} className="text-3xl cursor-pointer md:hidden" />
            ) : (
              <IoMenu onClick={onToggleMenu} className="text-3xl cursor-pointer md:hidden" />
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar2;