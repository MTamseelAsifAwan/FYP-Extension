import React from 'react';

const ModalDropdownmenu = ({ children, closeModalDropdownmenu }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <button className="absolute top-2 right-2 text-black" onClick={closeModalDropdownmenu}>
          &#x2716;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalDropdownmenu;
