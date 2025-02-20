import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from "../../Auth/Firebase.jsx";
import { doc, getDoc } from "firebase/firestore";

const TaskDetail = () => {
  const { taskid } = useParams(); // Get the task ID from the route params
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(firestore, `users/${auth.currentUser.uid}/Projects/${projectid}/Tasks/${taskid}`));
        if (taskDoc.exists()) {
          setTask(taskDoc.data());
        } else {
          console.log('No such task!');
        }
      } catch (error) {
        console.log('Error fetching task details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskid]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>No task found!</div>;
  }

  return (
    <div className="task-detail-container">
      <h2 className="task-title">{task.name}</h2>
      <p>Status: {task.status}</p>
      <p>Progress: {task.progress}%</p>
      <p>Assigned To: {task.assignedTo}</p>
      <p>Description: {task.description}</p>
      {/* Render other task details as needed */}
    </div>
  );
};

export default TaskDetail;
