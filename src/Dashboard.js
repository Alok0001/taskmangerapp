import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Add a CSS file for styling

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'low',
    category: 'personal',
    completed: false,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [currentDate] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      setIsLoggedIn(true);
      setAccessToken(accessToken);
      loadTasks(accessToken);
    }
  }, []);

  const loadTasks = (accessToken) => {
    axios
      .get('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Error loading tasks: ', error);
      });
  };

  const createTask = () => {
    axios
      .post('http://localhost:5000/tasks', newTask, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        loadTasks(accessToken);
        setNewTask({
          title: '',
          description: '',
          due_date: '',
          priority: 'low',
          category: 'personal',
          completed: false,
        });
      })
      .catch((error) => {
        console.error('Error creating task: ', error);
      });
  };

  const updateTask = (taskId, taskData) => {
    axios
      .put(`http://localhost:5000/tasks/${taskId}`, taskData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        // Update the state after the API call is successful
        const updatedTasks = tasks.map((task) =>
          task._id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
      })
      .catch((error) => {
        console.error('Error updating task: ', error);
      });
  };
  

  const deleteTask = (taskId) => {
    axios
      .delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        loadTasks(accessToken);
      })
      .catch((error) => {
        console.error('Error deleting task: ', error);
      });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setAccessToken('');
    setTasks([]);
    navigate('/login');
  };

  // Helper function to determine task status
  const getTaskStatus = (dueDate, completed) => {
    const taskDueDate = new Date(dueDate);
    if (completed) return 'Completed';
    if (taskDueDate < currentDate) return 'Overdue';
    if (taskDueDate.toDateString() === currentDate.toDateString()) return 'Due Today';
    return 'Upcoming';
  };

  return (
    <div className="dashboard-container">
      <h1>Task Dashboard</h1>
      {isLoggedIn ? (
        <div>
          <div className="task-form">
            <h2>Create New Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <input
              type="date"
              placeholder="Due Date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="urgent">Urgent</option>
            </select>
            <button onClick={createTask}>Create Task</button>
          </div>
          <div>
            <h2>Task List</h2>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className={`task-item ${getTaskStatus(task.due_date, task.completed)}`}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{task.due_date}</td>
                    <td>{task.priority}</td>
                    <td>{task.category}</td>
                    <td>{getTaskStatus(task.due_date, task.completed)}</td>
                    <td>
                      <button onClick={() => updateTask(task._id, { completed: !task.completed })}>
                        {task.completed ? 'Reopen' : 'Complete'}
                      </button>
                      <button onClick={() => deleteTask(task._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h2>Login to access the dashboard</h2>
          <p>
            Don't have an account? <Link to="/login">Sign Up</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
