import React from 'react';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaRobot, FaUsers, FaPaperPlane } from 'react-icons/fa';

const downToUp = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

const Footer = () => {
  return (
    <footer className='bg-black lg:h-56 lg:pt-3 sm:h-60 md:w-full font-serif'>
      <h1 className='text-white font-bold text-lg text-center'>
        Subscribe to our Newsletter
      </h1>
      <div className='flex justify-center'>
        <input
          type='text'
          placeholder='Your Email Address'
          className='p-2 rounded-md text-center max-w-xs w-full'
        />
        <button className='bg-purple-900 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-950'>
          <FaPaperPlane className='text-sm' />
        </button>
      </div>
      <div className='p-6 font-bold text-3xl border-b border-warning_light'>
        <h1 className='text-purple-900'>Sprity</h1>
      </div>
      <div className='grid grid-flow-col mt-4 justify-center items-center'>
        <p className='text-center text-white font-bold text-sm'>
          Copyright © 2024 Sprinty. All rights reserved.
        </p>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={downToUp}
          transition={{ duration: 1 }}
          className='flex items-center gap-4 sm:ml-4'
        >
          {/* Social Button 1 */}
          <div className='social-button'>
            <button
              aria-label='Instagram'
              className='relative lg:w-12 lg:h-12 sm:w-8 rounded-full group'
            >
              <div className='floater w-full h-full absolute top-0 left-0 bg-pink-600 rounded-full duration-300 group-hover:-top-8 group-hover:shadow-2xl'></div>
              <div className='icon relative z-10 w-full h-full flex items-center justify-center border-2 border-pink-600 rounded-full'>
                {/* SVG code for Instagram */}
              </div>
            </button>
          </div>
          {/* Social Button 2 */}
          <div className='social-button'>
            <button
              aria-label='LinkedIn'
              className='relative lg:w-12 lg:h-12 sm:w-8 rounded-full group'
            >
              <div className='floater w-full h-full absolute top-0 left-0 bg-blue-500 rounded-full duration-300 group-hover:-top-8 group-hover:shadow-2xl'></div>
              <div className='icon relative z-10 w-full h-full flex items-center justify-center border-2 border-blue-500 rounded-full'>
                {/* SVG code for LinkedIn */}
              </div>
            </button>
          </div>
          {/* Social Button 3 */}
          <div className='social-button'>
            <button
              aria-label='Facebook'
              className='relative lg:w-12 lg:h-12 sm:w-8 rounded-full group'
            >
              <div className='floater w-full h-full absolute top-0 left-0 bg-blue-700 rounded-full duration-300 group-hover:-top-8 group-hover:shadow-2xl'></div>
              <div className='icon relative z-10 w-full h-full flex items-center justify-center border-2 border-blue-700 rounded-full'>
                {/* SVG code for Facebook */}
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
