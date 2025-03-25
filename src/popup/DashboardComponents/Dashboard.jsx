import React, { useState, useRef, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import heroimage from '../Ladingpagecomponents/assets/hero/hero-background.jpg';
import Tasks from './Tasks.jsx';
const Chatroom = lazy(() => import('./Setting.jsx'));
import UserProvider from './context/context.jsx';
const Projecthome = lazy(() => import('./Projecthome'));
import axios from 'axios';

function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [projectData, setProjectData] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const dropdownMenuRef = useRef();
  const btnref = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totaltodo, settodo] = useState(0);
  const [totalinprogress, setinprogress] = useState(0);
  const [totaldone, setotaldone] = useState(0);
  const [taskSummary, setTaskSummary] = useState({});
  const [graphLoading, setGraphLoading] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const processIssuesData = useCallback((issues) => {
    const categoryCounts = {
      toDo: 0,
      inProgress: 0,
      done: 0,
    };

    const processedData = issues.map((issue) => {
      const statusCategory = issue.fields.status?.statusCategory?.name || 'Unknown';

      if (statusCategory.trim().toLowerCase() === 'to do') {
        categoryCounts.toDo += 1;
        settodo(categoryCounts.toDo);
      } else if (statusCategory.trim().toLowerCase() === 'in progress') {
        categoryCounts.inProgress += 1;
        setinprogress(categoryCounts.inProgress);
      } else if (statusCategory.trim().toLowerCase() === 'done') {
        categoryCounts.done += 1;
        setotaldone(categoryCounts.done);
      }

      return {
        name: issue.fields.summary || 'Unknown',
        statusCategory,
      };
    });

    setTaskSummary(categoryCounts);

    return processedData;
  }, []);

  // Add these helper functions for consistent token handling
  const getAuthToken = () => {
    // Try multiple token storage locations
    const token = localStorage.getItem('userToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('userToken');
    
    if (!token) {
      console.error('⚠️ No auth token found in storage');
      return null;
    }
    
    console.log('✅ Auth token retrieved:', token.substring(0, 10) + '...');
    return token;
  };
  
  const createAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) return {};
    
    // Return with correct capitalization and format
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTasks = useCallback(async (projectId) => {
    try {
      setLoading(true);
      console.log(`/api/tasks API hit with projectId: ${projectId}`);
      
      // Get headers with authentication token
      const headers = createAuthHeaders();
      console.log('Request headers:', JSON.stringify(headers));
      
      if (!headers.Authorization) {
        console.error('No authorization token available');
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:4000/api/tasks?projectId=${projectId}`, {
        headers
      });
      
      console.log('Tasks API response status:', response.status);
      const issues = response.data.issues;
      const processedData = processIssuesData(issues);
      setProjectTasks(processedData);
      setTotalTasks(response.data.total);
    } catch (err) {
      console.error('Error fetching tasks data:', err);
      if (err.response) {
        console.error('Server response status:', err.response.status);
        console.error('Server response data:', err.response.data);
      }
      setError('Error fetching data');
    } finally {
      setLoading(false);
      setGraphLoading(false);
    }
  }, [processIssuesData]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      console.log('/api/projects API hit');
      
      // Get headers with authentication token
      const headers = createAuthHeaders();
      console.log('Request headers:', JSON.stringify(headers));
      
      if (!headers.Authorization) {
        console.error('No authorization token available');
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:4000/api/projects', {
        headers
      });
      
      console.log('Projects API response status:', response.status);
      setProjectData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects data:', err);
      if (err.response) {
        console.error('Server response status:', err.response.status);
        console.error('Server response data:', err.response.data);
      }
      setError(err.message || 'Failed to fetch projects');
      setLoading(false);
    }
  }, []);

  // REMOVE the mock token useEffect and replace it with a proper token validation
  useEffect(() => {
    // Check if we have a token and validate it's in the right format
    const token = getAuthToken();
    if (token) {
      // Verify token format (Firebase tokens are JWTs that should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format - not a valid JWT');
        localStorage.removeItem('userToken');
        setError('Invalid authentication token. Please log in again.');
      } else {
        console.log('Token format appears valid (has three parts)');
      }
    } else {
      console.warn('No authentication token found');
      setError('Please log in to access your projects');
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target) &&
        btnref.current && !btnref.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchProjects();
    }
  }, [activeSection, fetchProjects]);

  const handleSelectSection = (section) => {
    setActiveSection(section);
  };

  const handleProjectSelect = useCallback((project) => {
    setSelectedProject(project);
    setProjectId(project.id);
    setShowDropdown(false);
    setGraphLoading(true);
    fetchTasks(project.id);

    setTimeout(() => {
      setGraphLoading(false);
    }, 1000);
  }, [fetchTasks]);


  const projectHomeComponent = useMemo(() => (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProvider>
        {graphLoading ? (
          <div className="loader">Loading graphs...</div>
        ) : (
          <Projecthome projectid={projectId} onSlectedProject={handleProjectSelect} graphLoading={graphLoading} />
        )}
      </UserProvider>
    </Suspense>
  ), [graphLoading, projectId, handleProjectSelect]);

  return (
    <>
      <div 
        className="relative bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: `url(${heroimage})`, 
          width: '700px', 
          height: '562px',
          maxWidth: '700px',
          maxHeight: '562px'
        }}
      >
        <div className="w-full h-full">
          {projectHomeComponent}
        </div>
      </div>      
    </>
  );
}

export default Dashboard;