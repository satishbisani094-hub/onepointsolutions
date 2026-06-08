import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiTruck, FiMapPin, FiMoreVertical } from 'react-icons/fi';

const TaskCard = ({ task, staffs, onUpdate }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${task.id}/status`, { status: newStatus });
      onUpdate();
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow mb-3 relative">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          task.type === 'Delivery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        }`}>
          {task.type}
        </span>
        <span className={`text-xs font-semibold ${
          task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          {task.priority}
        </span>
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {task.type} for {task.customer?.name}
      </h4>
      <div className="space-y-2 mt-3">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <FiMapPin className="mr-2" /> <span className="truncate">{task.location_address}</span>
        </div>
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <FiClock className="mr-2" /> <span>{new Date(task.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
        <div className="flex items-center">
          {task.assigned_staff ? (
            <>
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold mr-2">
                {task.assigned_staff.name.charAt(0)}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{task.assigned_staff.name}</span>
            </>
          ) : (
            <span className="text-xs text-amber-500 font-medium flex items-center">
              <FiAlertCircle className="mr-1" /> Unassigned
            </span>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <FiMoreVertical />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10 text-xs overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-500">Update Status</div>
              {['Pending', 'Assigned', 'InProgress', 'Completed', 'Delayed', 'Cancelled'].map((st) => (
                <button 
                  key={st} 
                  onClick={() => handleStatusChange(st)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Column = ({ title, status, tasks, icon, colorClass, staffs, onUpdate }) => (
  <div className="flex flex-col bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4 h-full min-h-[500px] border border-slate-200 dark:border-slate-700/50">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center">
        <div className={`p-1.5 rounded-lg text-white mr-2 shadow-sm ${colorClass}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
        {tasks.length}
      </span>
    </div>
    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
      {tasks.map(task => <TaskCard key={task.id} task={task} staffs={staffs} onUpdate={onUpdate} />)}
      {tasks.length === 0 && (
        <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
          No tasks
        </div>
      )}
    </div>
  </div>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [taskRes, staffRes, conflictRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/tasks/conflicts')
      ]);
      setTasks(taskRes.data);
      setStaffs(staffRes.data);
      setConflicts(conflictRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track all deliveries and pickups.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hidden md:flex overflow-hidden shadow-sm">
            <button className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white">Board</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">List</button>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30">
            <FiPlus className="mr-2" /> New Task
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-900/20 dark:border-rose-800/50">
          <h3 className="text-rose-800 dark:text-rose-400 font-bold flex items-center mb-2">
            <FiAlertCircle className="mr-2" /> Schedule Conflicts Detected ({conflicts.length})
          </h3>
          <ul className="list-disc list-inside text-sm text-rose-700 dark:text-rose-300 space-y-1">
            {conflicts.map((c, i) => (
              <li key={i}><strong>{c.staff}</strong> is double-booked: {c.task1} &amp; {c.task2}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-slate-500">Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 overflow-hidden pb-4">
          <Column 
            title="Pending" 
            status="Pending" 
            tasks={tasks.filter(t => t.status === 'Pending')} 
            icon={<FiAlertCircle className="w-4 h-4" />}
            colorClass="bg-amber-500"
            staffs={staffs}
            onUpdate={fetchData}
          />
          <Column 
            title="Assigned" 
            status="Assigned" 
            tasks={tasks.filter(t => t.status === 'Assigned')} 
            icon={<FiPlus className="w-4 h-4" />}
            colorClass="bg-blue-500"
            staffs={staffs}
            onUpdate={fetchData}
          />
          <Column 
            title="In Progress" 
            status="InProgress" 
            tasks={tasks.filter(t => t.status === 'InProgress')} 
            icon={<FiTruck className="w-4 h-4" />}
            colorClass="bg-purple-500"
            staffs={staffs}
            onUpdate={fetchData}
          />
          <Column 
            title="Completed" 
            status="Completed" 
            tasks={tasks.filter(t => t.status === 'Completed')} 
            icon={<FiCheckCircle className="w-4 h-4" />}
            colorClass="bg-emerald-500"
            staffs={staffs}
            onUpdate={fetchData}
          />
        </div>
      )}
    </div>
  );
};

export default Tasks;
