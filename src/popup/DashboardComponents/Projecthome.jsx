import React, { useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { FaTasks, FaClipboardList, FaHourglassStart, FaCheckCircle, FaCaretUp, FaSortDown, FaChartLine, FaSignOutAlt, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from './context/context.jsx';
// Import Firebase auth
import { getAuth } from 'firebase/auth';

// Add IndexedDB utility functions
const saveTasksToDB = async (projectId, tasks) => {
  try {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.put({ id: projectId, data: tasks });
    await tx.complete;
    console.log('Tasks saved to IndexedDB');
  } catch (error) {
    console.error('Error saving tasks to IndexedDB:', error);
  }
};

const getTasksFromDB = async (projectId) => {
  try {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const result = await store.get(projectId);
    await tx.complete;
    return result ? result.data : null;
  } catch (error) {
    console.error('Error getting tasks from IndexedDB:', error);
    return null;
  }
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sprintyDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const COLORS = ['#0088FE', '#00C49F', '#eab308', '#FF8042'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const Projecthome = ({ projectid, onSlectedProject, graphLoading }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [projectTasks, setProjectTasks] = useState([]);
  const [error, setError] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [projectData, setProjectData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { setContextProjectId } = useContext(UserContext);
  const [selectedProjectname, setSelectedProjectname] = useState(null);
  const [selectedProjectmethodology, setSelectedProjectmethodology] = useState(null);
  const dropdownMenuRef = useRef();
  const btnref = useRef();
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [taskSummary, setTaskSummary] = useState({ toDo: 0, inProgress: 0, done: 0, percentages: {} });
  const [authToken, setAuthToken] = useState(null);
  const [activeTab, setActiveTab] = useState('progress'); // New state for tab control
  const [jiraBaseUrl, setJiraBaseUrl] = useState('https://your-jira-instance.atlassian.net');

  const processIssuesData = useCallback((issues) => {
    const categoryCounts = { toDo: 0, inProgress: 0, done: 0 };

    const processedData = issues.map((issue) => {
      const statusCategory = issue.fields.status?.statusCategory?.name || 'Unknown';
      const priority = issue.fields.priority?.name || 'None';
      let progressPercentage = 0;

      if (statusCategory.trim().toLowerCase() === 'to do') {
        progressPercentage = 15;
        categoryCounts.toDo += 1;
      } else if (statusCategory.trim().toLowerCase() === 'in progress') {
        progressPercentage = 50;
        categoryCounts.inProgress += 1;
      } else if (statusCategory.trim().toLowerCase() === 'done') {
        progressPercentage = 100;
        categoryCounts.done += 1;
      }

      return {
        name: issue.fields.summary || 'Unknown',
        progress: progressPercentage,
        status: statusCategory,
        priority,
        statusCategory,
      };
    });

    const totalTasks = categoryCounts.toDo + categoryCounts.inProgress + categoryCounts.done;
    const percentages = {
      toDo: ((categoryCounts.toDo / totalTasks) * 100).toFixed(2),
      inProgress: ((categoryCounts.inProgress / totalTasks) * 100).toFixed(2),
      done: ((categoryCounts.done / totalTasks) * 100).toFixed(2),
    };

    setTaskSummary({ ...categoryCounts, percentages });
    return processedData;
  }, []);

  // Get Firebase authentication token
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const auth = getAuth();
        if (!auth) {
          console.error('Firebase auth is not initialized');
          toast.error('Authentication service not available');
          return;
        }
        
        const user = auth.currentUser;
        if (user) {
          try {
            const token = await user.getIdToken(true); // Force refresh the token
            console.log('Auth token obtained successfully');
            setAuthToken(token);
          } catch (error) {
            console.error('Error getting auth token:', error);
            toast.error('Authentication error. Please sign in again.');
          }
        } else {
          console.log('No user is currently signed in');
          setAuthToken(null);
          toast.error('You need to be logged in to access this page');
        }
      } catch (error) {
        console.error('Firebase auth error:', error);
        toast.error('Authentication service error');
      }
    };

    getAuthToken();
    
    // Set up auth state listener
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          console.log('Auth token refreshed on auth state change');
          setAuthToken(token);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      } else {
        setAuthToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Create axios instance with interceptors
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:4000'
    });
    
    // Request interceptor to add auth token to all requests
    instance.interceptors.request.use(
      (config) => {
        if (authToken) {
          config.headers['Authorization'] = `Bearer ${authToken}`;
          console.log('Adding auth token to request:', config.url);
        } else {
          console.warn('No auth token available for request:', config.url);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor to handle common errors
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error Response:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    
    return instance;
  }, [authToken]);

  const fetchTasks = useCallback(async (projectId) => {
    const storedProjectId = localStorage.getItem('selectedProjectId') || projectId;
    const userToken = authToken || localStorage.getItem('userToken'); // Get the user token

    if (!storedProjectId) {
      toast.error('Please select a project to view tasks');
      return;
    }

    if (!userToken) {
      console.log('No auth token available for fetchTasks');
      toast.error('Please log in to view tasks');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Fetching tasks for project: ${storedProjectId}`);
      
      let allIssues = [];
      const maxResults = 50; // Increase the batch size
      const response = await api.get(`/api/tasks?projectId=${storedProjectId}&startAt=0&maxResults=1`);
      console.log('Initial tasks API response:', response.status);
      
      const total = response.data.total;
      const batchCount = Math.ceil(total / maxResults);

      // Create an array of promises to fetch batches in parallel
      const fetchPromises = Array.from({ length: batchCount }, (_, index) => {
        const startAt = index * maxResults;
        return api.get(`/api/tasks?projectId=${storedProjectId}&startAt=${startAt}&maxResults=${maxResults}`);
      });

      // Wait for all promises to resolve
      const responses = await Promise.all(fetchPromises);
      responses.forEach(response => {
        allIssues = [...allIssues, ...response.data.issues];
      });

      const processedData = processIssuesData(allIssues);
      console.log('Processed task data:', processedData.length, 'items'); 
      setProjectTasks(processedData);
      setGraphData(processedData);
      setProjectId(storedProjectId);
      localStorage.setItem('projectTasks', JSON.stringify(processedData));
      saveTasksToDB(storedProjectId, processedData); // Save to IndexedDB
      return processedData;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMsg = 'Failed to fetch tasks';
      if (err.response?.status === 401) {
        errorMsg = 'Authentication error. Please log in again.';
      } else if (err.response?.data?.error) {
        errorMsg = `Error: ${err.response.data.error}`;
      }
      toast.error(errorMsg);
      
      // Try to use cached data from IndexedDB first
      const storedData = await getTasksFromDB(storedProjectId);
      if (storedData) {
        console.log('Using IndexedDB cached data');
        setProjectTasks(storedData);
        setGraphData(storedData);
        return storedData;
      }
      
      // Fall back to localStorage if IndexedDB fails
      const localStorageData = localStorage.getItem('projectTasks');
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        setProjectTasks(parsedData);
        setGraphData(parsedData);
        return parsedData;
      }
    } finally {
      setIsLoading(false);
    }
  }, [processIssuesData, authToken, api]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target) &&
        btnref.current &&
        !btnref.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleProjectSelect = useCallback((project) => {
    setSelectedProject(project);
    setContextProjectId('fg');
    setSelectedProjectname(project.name);
    setSelectedProjectmethodology(project.key);
    setProjectId(project.id);
    setShowDropdown(false);

    setIsGraphLoading(true);
    fetchTasks(project.id).then((data) => {
      setGraphData(data);
      setTimeout(() => {
        setIsGraphLoading(false);
      }, 1000);
    });

    localStorage.setItem('selectedProjectId', project.id);
    localStorage.setItem('selectedProjectname', project.name);
    localStorage.setItem('selectedProjectmethodology', project.key);
  }, [fetchTasks]);

  const fetchProjects = useCallback(async () => {
    if (!authToken) {
      console.log('No auth token available for fetchProjects');
      return;
    }

    try {
      console.log('Fetching projects...');
      const response = await api.get('/api/projects');
      console.log('Projects API response:', response.status);
      setProjectData(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMsg = 'Failed to fetch projects';
      if (err.response?.status === 401) {
        errorMsg = 'Authentication error. Please log in again.';
      } else if (err.response?.data?.error) {
        errorMsg = `Error: ${err.response.data.error}`;
      }
      toast.error(errorMsg);
    }
  }, [authToken, api]);

  // Effect to fetch projects when auth token is available
  useEffect(() => {
    if (authToken) {
      console.log('Auth token available, fetching projects');
      fetchProjects();
      
      const storedProjectId = localStorage.getItem('selectedProjectId');
      if (storedProjectId) {
        const storedProjectname = localStorage.getItem('selectedProjectname');
        const storedProjectmethodology = localStorage.getItem('selectedProjectmethodology');
        setSelectedProjectname(storedProjectname);
        setSelectedProjectmethodology(storedProjectmethodology);
        fetchTasks(storedProjectId);
      }
    } else {
      console.log('No auth token yet, skipping API calls');
    }
  }, [authToken, fetchProjects, fetchTasks]);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  const pieChartData = useMemo(() => [
    { name: 'To Do', value: taskSummary.toDo, priority: 'Low' },
    { name: 'In Progress', value: taskSummary.inProgress, priority: 'Medium' },
    { name: 'Done', value: taskSummary.done, priority: 'High' },
  ], [taskSummary]);

  // New data for priority breakdown chart
  const priorityChartData = useMemo(() => {
    if (!projectTasks.length) return [];
    
    const priorityCount = projectTasks.reduce((acc, task) => {
      const priority = task.priority || 'None';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority,
      count,
    }));
  }, [projectTasks]);

  // New data for assignee breakdown chart
  const assigneeChartData = useMemo(() => {
    if (!projectTasks.length) return [];
    
    // Extract assignee information and count tasks per assignee
    const assigneeCount = projectTasks.reduce((acc, task) => {
      const assigneeName = 
        task.fields?.assignee?.displayName || 
        task.fields?.assignee?.name || 
        'Unassigned';
      
      acc[assigneeName] = (acc[assigneeName] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array format for the chart
    // Sort by count in descending order to show most assigned people first
    return Object.entries(assigneeCount)
      .map(([assignee, count]) => ({
        assignee: assignee.length > 12 ? assignee.substring(0, 12) + '...' : assignee,
        count,
        fullName: assignee // Store full name for tooltip
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Limit to top 8 assignees for better visibility
  }, [projectTasks]);

  // New data for cumulative task completion over time chart
  const cumulativeCompletionData = useMemo(() => {
    if (!projectTasks.length) return [];
    
    // For demonstration, we'll generate time-based data
    // In a real scenario, you'd use actual completion timestamps from your tasks
    
    // Group tasks by status to find completed ones
    const completedTasks = projectTasks.filter(task => 
      task.statusCategory?.trim().toLowerCase() === 'done' || 
      task.status?.trim().toLowerCase() === 'done' ||
      task.progress === 100
    );
    
    // If there's no completed tasks, return empty array
    if (!completedTasks.length) return [];
    
    // For demo purposes, we'll create dates spanning the last 3 months
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    // Distribute completed tasks over this time range
    const timeRange = today - threeMonthsAgo;
    
    // Create data points
    const dataPoints = [];
    let cumulativeCount = 0;
    const intervals = Math.min(completedTasks.length, 10); // Max 10 data points 
    
    for (let i = 0; i < intervals; i++) {
      // Calculate a date in the past based on position in the interval
      const timeOffset = (i / intervals) * timeRange;
      const date = new Date(threeMonthsAgo.getTime() + timeOffset);
      
      // Add however many tasks were "completed" by this date
      const tasksCompletedInThisInterval = Math.ceil(completedTasks.length / intervals);
      cumulativeCount += tasksCompletedInThisInterval;
      
      // Cap at total completed tasks
      const finalCount = Math.min(cumulativeCount, completedTasks.length);
      
      dataPoints.push({
        date: date.toLocaleDateString(),
        completed: finalCount,
      });
    }
    
    // Make sure last point shows total completed tasks
    if (dataPoints.length > 0) {
      dataPoints[dataPoints.length - 1].completed = completedTasks.length;
    }
    
    return dataPoints;
  }, [projectTasks]);

  // Enhance the CustomTooltip to handle multiple chart types
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Handle different tooltip content based on data type
      if (payload[0].name === 'completed') {
        return (
          <div
            className="custom-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#f8f8ff',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <p className="label">{`Date: ${payload[0].payload.date}`}</p>
            <p className="label">{`Completed Tasks: ${payload[0].value}`}</p>
          </div>
        );
      } else if (payload[0].payload.assignee) {
        return (
          <div
            className="custom-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#f8f8ff',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <p className="label">{`Assignee: ${payload[0].payload.fullName || payload[0].payload.assignee}`}</p>
            <p className="label">{`Tasks: ${payload[0].payload.count}`}</p>
          </div>
        );
      } else if (payload[0].payload.priority && !payload[0].payload.name) {
        return (
          <div
            className="custom-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#f8f8ff',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <p className="label">{`Priority: ${payload[0].payload.priority}`}</p>
            <p className="label">{`Tasks: ${payload[0].payload.count}`}</p>
          </div>
        );
      } else {
        // Original tooltip for task progress
        const { name, progress, priority } = payload[0].payload;
        return (
          <div
            className="custom-tooltip"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#f8f8ff',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <p className="label">{`Issue: ${name}`}</p>
            <p className="label">{`Progress: ${progress}%`}</p>
            <p className="label">{`Priority: ${priority}`}</p>
          </div>
        );
      }
    }
    return null;
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      toast.success('Signed out successfully');
      // Clear local storage data
      localStorage.removeItem('selectedProjectId');
      localStorage.removeItem('selectedProjectname');
      localStorage.removeItem('selectedProjectmethodology');
      localStorage.removeItem('projectTasks');
      // Redirect or update UI as needed
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  // Open Jira project in browser
  const openProjectWebsite = () => {
    if (selectedProject && selectedProject.key) {
      // Construct the URL to the project in Jira
      const projectUrl = `${jiraBaseUrl}/browse/${selectedProject.key}`;
      window.open(projectUrl, '_blank');
    } else {
      toast.info('Please select a project first');
    }
  };

  // Extract Jira base URL from project data if available
  useEffect(() => {
    if (projectData.length > 0 && projectData[0].self) {
      try {
        // Extract base URL from the API response
        const url = new URL(projectData[0].self);
        setJiraBaseUrl(`${url.protocol}//${url.hostname}`);
      } catch (error) {
        console.error('Error extracting Jira URL:', error);
      }
    }
  }, [projectData]);

  // Tab switching handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-[562px] w-[700px] flex flex-col overflow-auto relative">
      {/* Top corner buttons */}
      <div className="absolute top-2 right-2 z-10">
        <button
          className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center"
          onClick={handleSignOut}
          title="Sign Out"
        >
          <FaSignOutAlt className="mr-1" /> Sign Out
        </button>
      </div>
      
      <div className="absolute top-2 left-2 z-10">
        <button
          className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
          onClick={openProjectWebsite}
          title="Open in Jira"
          disabled={!selectedProject}
        >
          <FaExternalLinkAlt className="mr-1" /> Go to Website
        </button>
      </div>

      <div className="flex flex-col p-2 mt-8"> {/* Added margin-top to make room for buttons */}
        <div className="flex-1">
          {selectedProjectname && selectedProjectmethodology ? (
            <div className="text-white text-xs">
              <p>
                <span className="font-bold ">Project Name:</span> {selectedProjectname}
              </p>
              <p>
                <span className="font-bold ">Project Methodology:</span> {selectedProjectmethodology}
              </p>
            </div>
          ) : (
            <p className="text-white text-xs">Please select a project to see the details.</p>
          )}
          
          <div className="flex flex-row justify-between items-center mt-1 gap-2">
            <div className="grid grid-cols-4 gap-1 w-[500px]">
              <TaskInfoBox
                title="Total"
                value={taskSummary.toDo + taskSummary.inProgress + taskSummary.done}
                icon={<FaTasks className="text-base text-yellow-500" />}
              />
              <TaskInfoBox
                title="To Do"
                value={taskSummary.toDo}
                icon={<FaClipboardList className="text-base text-yellow-500" />}
              />
              <TaskInfoBox
                title="In Progress"
                value={taskSummary.inProgress}
                icon={<FaHourglassStart className="text-base text-yellow-500" />}
              />
              <TaskInfoBox
                title="Done"
                value={taskSummary.done}
                icon={<FaCheckCircle className="text-base text-yellow-500" />}
              />
            </div>
            
            <div className="relative">
              <button
                className="flex items-center w-[140px] px-2 py-1 text-xs font-serif text-white bg-purple-900 border-none rounded-md hover:bg-purple-950"
                onClick={toggleDropdown}
                ref={btnref}
              >
                Select Project
                {showDropdown ? <FaCaretUp className="ml-1" /> : <FaSortDown className="ml-1" />}
              </button>
              {showDropdown && (
                <div
                  ref={dropdownMenuRef}
                  className="absolute right-0 mt-1 h-24 w-40 p-1 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-gray-300 rounded-lg shadow-lg overflow-auto z-10"
                >
                  <ul className="grid gap-1">
                    {projectData.length > 0 ? (
                      projectData.map((project) => (
                        <li
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className="px-2 py-1 text-center text-xs bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg cursor-pointer"
                        >
                          {project.name || "Unnamed Project"}
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-gray-500 text-xs">No projects found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isGraphLoading || isLoading ? (
        <div className="loader">
          <div className="bg-gray-300 h-40 w-full rounded-md animate-pulse mb-2">
            <p className="flex items-center justify-center h-full font-serif text-xs font-bold">
              {isLoading ? 'Loading' : 'No project selected'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-1 mt-1 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm rounded-lg p-1">
            <div className="col-span-4">
              {error ? (
                <p className="text-red-500 text-xs">{error}</p>
              ) : (
                <div className="overflow-x-auto" style={{ width: '100%' }}>
                  <ResponsiveContainer width="100%" height={210} minWidth={Math.max(500, graphData.length * 20)}>
                    <ComposedChart
                      data={graphData}
                      margin={{
                        top: 0,
                        right: 5,
                        bottom: 0,
                        left: 0,
                      }}
                    >
                      <CartesianGrid stroke="#1c2d41" strokeDasharray="3 3" />
                      <XAxis stroke="#fffafa" dataKey="." tick={{ fontSize: 8 }} />
                      <YAxis stroke="#fffafa" domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="progress"
                        fill="#e6e6fa"
                        stroke="#e6e6fa"
                      />
                      <Bar dataKey="progress" barSize={10} style={{ fill: "#0000CD" }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="col-span-1 flex flex-col items-center">
              {/* Tabs navigation - updated with 4 tabs */}
              <div className="flex w-full mb-1 border-b border-gray-700 overflow-x-auto">
                <button
                  className={`px-1 py-0.5 text-[9px] font-medium ${
                    activeTab === 'progress' 
                      ? 'text-yellow-500 border-b-2 border-yellow-500' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('progress')}
                >
                  Progress
                </button>
                <button
                  className={`px-1 py-0.5 text-[9px] font-medium ${
                    activeTab === 'priority' 
                      ? 'text-yellow-500 border-b-2 border-yellow-500' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('priority')}
                >
                  Priority
                </button>
                <button
                  className={`px-1 py-0.5 text-[9px] font-medium ${
                    activeTab === 'assignee' 
                      ? 'text-yellow-500 border-b-2 border-yellow-500' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('assignee')}
                >
                  Assignee
                </button>
                <button
                  className={`px-1 py-0.5 text-[9px] font-medium ${
                    activeTab === 'trend' 
                      ? 'text-yellow-500 border-b-2 border-yellow-500' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleTabChange('trend')}
                  title="Completion Trend"
                >
                  <FaChartLine className="inline mr-1" size={8} />
                  Trend
                </button>
              </div>
              
              {/* Display chart based on active tab - now with 4 options */}
              {activeTab === 'progress' ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.priority === "High"
                              ? "#32cd32"
                              : entry.priority === "Medium"
                              ? "#eab308"
                              : "#FF0000"
                          }
                        />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : activeTab === 'priority' ? (
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart
                    data={priorityChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 8 }} />
                    <YAxis 
                      dataKey="priority" 
                      type="category" 
                      scale="band" 
                      tick={{ fontSize: 8 }} 
                      width={40}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      barSize={15} 
                      fill="#8884d8" 
                      name="Tasks"
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.priority === "Highest" || entry.priority === "High"
                              ? "#FF0000"
                              : entry.priority === "Medium"
                              ? "#eab308"
                              : entry.priority === "Low" || entry.priority === "Lowest"
                              ? "#32cd32"
                              : "#8884d8"
                          }
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : activeTab === 'assignee' ? (
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart
                    data={assigneeChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 8 }} />
                    <YAxis 
                      dataKey="assignee" 
                      type="category" 
                      scale="band" 
                      tick={{ fontSize: 8 }} 
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      barSize={15} 
                      fill="#8884d8" 
                      name="Tasks"
                    >
                      {assigneeChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                // New Cumulative Completion Trend chart
                <ResponsiveContainer width="100%" height={180}>
                  {cumulativeCompletionData.length > 0 ? (
                    <LineChart
                      data={cumulativeCompletionData}
                      margin={{ top: 5, right: 5, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 8 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        tick={{ fontSize: 8 }} 
                        label={{ 
                          value: 'Tasks', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 8 }
                        }} 
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        name="completed"
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ fill: '#82ca9d', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-[10px] text-center">
                        No completion data available
                      </p>
                    </div>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TaskInfoBox = ({ title, value, icon }) => (
  <div className="flex flex-col items-center h-16 w-full cursor-pointer hover:translate-y-1 text-white bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm rounded-md p-1">
    {icon}
    <span className="text-[10px] font-semibold">{title}</span>
    <span className="text-xs font-bold text-green-600 mt-0.5">{value}</span>
  </div>
);

export default Projecthome;