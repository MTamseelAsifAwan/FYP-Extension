import { useState } from 'react';
import ProjectContext from './context';
const ProjectProvider = ({ children }) => {
  const [contextProjectId, setContextProjectId] = useState(null);
  const setProject = (id) => {
    setContextProjectId(id);
  };
  return (
    <ProjectContext.Provider value={{ contextProjectId, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;

