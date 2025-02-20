import React, { useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { FaTasks, FaClipboardList, FaHourglassStart, FaCheckCircle, FaCaretUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from './context/context.jsx';

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

  const fetchTasks = useCallback(async (projectId) => {
    const storedProjectId = localStorage.getItem('selectedProjectId') || projectId;

    if (storedProjectId) {
      try {
        const response = await axios.get(`http://localhost:4000/api/tasks?projectId=${storedProjectId}`);
        const issues = response.data.issues;
        const processedData = processIssuesData(issues);
        setProjectTasks(processedData);
        setGraphData(processedData);
        setIsLoading(false);
        localStorage.setItem('projectTasks', JSON.stringify(processedData));
        setProjectId(storedProjectId);
        return processedData;
      } catch (err) {
        toast.error('Error fetching data! Please check your internet connection.');
        console.error('Error fetching data:', err);

        const storedData = localStorage.getItem('projectTasks');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setProjectTasks(parsedData);
          setGraphData(parsedData);
          setIsLoading(false);
          return parsedData;
        }
      }
    } else {
      toast.error('Please select a project to view tasks');
    }
  }, [processIssuesData]);

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
    try {
      const response = await axios.get('http://localhost:4000/api/projects');
      setProjectData(response.data);
    } catch (err) {
      toast.error('Failed to fetch projects.');
      console.error('Error fetching projects:', err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const storedProjectId = localStorage.getItem('selectedProjectId');
    if (storedProjectId) {
      const storedProjectname = localStorage.getItem('selectedProjectname');
      const storedProjectmethodology = localStorage.getItem('selectedProjectmethodology');
      setSelectedProjectname(storedProjectname);
      setSelectedProjectmethodology(storedProjectmethodology);
      fetchTasks(storedProjectId);
    }
  }, [fetchProjects, fetchTasks]);

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
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
    return null;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row h-full p-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Project Details</h1>
          {selectedProjectname && selectedProjectmethodology ? (
            <div className="text-white">
              <p>
                <span className="font-bold">Project Name:</span> {selectedProjectname}
              </p>
              <p>
                <span className="font-bold">Project Methodology:</span> {selectedProjectmethodology}
              </p>
            </div>
          ) : (
            <p className="text-white">Please select a project to see the details.</p>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 w-[25rem] gap-0.5 mt-3 ">
            <TaskInfoBox
              title="Total Tasks"
              value={taskSummary.toDo + taskSummary.inProgress + taskSummary.done}
              icon={<FaTasks className="text-xl text-yellow-500 " />}
            />
            <TaskInfoBox
              title="To Do Tasks"
              value={taskSummary.toDo}
              icon={<FaClipboardList className="text-xl text-yellow-500" />}
            />
            <TaskInfoBox
              title="In Progress Tasks"
              value={taskSummary.inProgress}
              icon={<FaHourglassStart className="text-xl text-yellow-500" />}
            />
            <TaskInfoBox
              title="Done Tasks"
              value={taskSummary.done}
              icon={<FaCheckCircle className="text-xl text-yellow-500" />}
            />
          </div>
        </div>
        <div className="flex-shrink-0 mt-6 lg:mt-0 lg:ml-4 relative">
          <button
            className="flex items-center w-[9rem] pl-2 text-base mt-14 font-serif text-white bg-purple-900 border-none rounded-md hover:bg-purple-950"
            onClick={toggleDropdown}
            ref={btnref}
          >
            Select Project
            {showDropdown ? <FaCaretUp className="ml-1" /> : <FaSortDown className="ml-1" />}
          </button>
          {showDropdown && (
            <div
              ref={dropdownMenuRef}
              className="absolute right-0 mt-2 h-36 w-48 p-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-gray-300 rounded-lg shadow-lg overflow-auto"
            >
              <ul className="grid gap-2">
                {projectData.length > 0 ? (
                  projectData.map((project) => (
                    <li
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className="px-4 py-2 text-center bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-lg cursor-pointer"
                    >
                      {project.name || "Unnamed Project"}
                    </li>
                  ))
                ) : (
                  <li className="text-center text-gray-500">No projects found</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
      {isGraphLoading || isLoading ? (
        <div className="loader">
          <div className="bg-gray-300 h-64 w-full rounded-md animate-pulse mb-20">
            <p className="flex items-center justify-center h-full font-serif font font-bold">
              {isLoading ? 'Loading' : 'No project selected'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 mt-0 bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm rounded-lg pt-1">
            <div className="col-span-4">
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart
                    data={graphData}
                    margin={{
                      top: 0,
                      right: 20,
                      bottom: 2,
                      left: 2,
                    }}
                  >
                    <CartesianGrid stroke="#1c2d41" />
                    <XAxis stroke="#fffafa" dataKey="." />
                    <YAxis stroke="#fffafa" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      fill="#e6e6fa"
                      stroke="#e6e6fa"
                    />
                    <Bar dataKey="progress" barSize={20} style={{ fill: "#0000CD" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="col-span-1 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-white mb-5">Total Progress</h1>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="55%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
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
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TaskInfoBox = ({ title, value, icon }) => (
  <div className="flex flex-col items-center h-36 w-full sm:w-48 md:w-full cursor-pointer transition-all duration-500 hover:translate-y-2 text-white bg-black bg-opacity-40 backdrop-filter backdrop-blur-sm rounded-3xl">
    {icon}
    <span className="text-lg font-semibold">{title}</span>
    <span className="text-3xl font-bold text-green-600 mt-2">{value}</span>
  </div>
);

export default Projecthome;