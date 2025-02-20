import React from 'react';

const ModalProject = ({ children, closeModalProject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <button className="absolute top-2 right-2 text-black" onClick={closeModalProject}>
          &#x2716;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalProject;
