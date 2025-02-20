/* eslint-disable react/prop-types */
import  { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  auth,database } from "../../Auth/Firebase.jsx";
import { ref, set,push } from 'firebase/database';

import {  serverTimestamp } from "firebase/firestore";

const NewProject = ({ closeModalProject }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('');
  const userId = auth.currentUser.uid;

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Create a reference to the 'Projects' node under the current user in the Realtime Database
      const projectRef = ref(database, `users/${userId}/Projects`);
  
      // Push a new project under this reference, generating a unique key
      const newProjectRef = push(projectRef);
  
      // Set the project data at the new reference
      await set(newProjectRef, {
        name: projectName,
        description: description,
        duration: duration,
        type: type,
        createdAt: serverTimestamp(), // This is a placeholder, Firebase RTDB uses timestamps differently
      });
  
      // Show success message
      toast.success('Project created successfully!');
      
      // Clear input fields
      setProjectName('');
      setDescription('');
      setDuration('');
  
      // Close the modal
      closeModalProject();
    } catch (error) {
      console.log('Error adding project', error);
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-1 rounded-lg w-full">
        <div className="flex items-center justify-center p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto space-y-6">
            <div className="font-serif justify-center grid grid-cols-1 items-center text-center flex-col">
              <h2 className="font-bold text-2xl sm:text-3xl text-purple-900 text-center">
                Sprinty <br /> Create New Project
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-sm text-black block mb-1">Project Name</label>
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-sm text-black block mb-1">Description</label>
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter Description"
                  required
                />
              </div>
              <div>
  <label className="font-semibold text-sm text-black block mb-1">Project Type</label>
  <select
    className="border rounded-lg px-3 py-2 text-sm w-full"
    value={type}
    onChange={(e) => setType(e.target.value)}
    required
  >
    <option value="" disabled>Select Project Type</option>
    <option value="Webapp">Webapp</option>
    <option value="Mobileapp">Mobileapp</option>
    <option value="DesktopApp">Desktop App</option>
    <option value="Other">Other</option>
  </select>
</div>

              <div>
                <label className="font-semibold text-sm text-black block mb-1">Duration</label>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="py-2 px-4 rounded-md border border-purple-900 w-24 text-purple-900 font-serif hover:font-bold hover:bg-purple-950 hover:text-white"
                onClick={closeModalProject}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-purple-900 text-white rounded-md w-24 hover:bg-purple-950 hover:font-semibold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default NewProject;
