import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiTruck, FiMapPin, FiMoreVertical, FiTrash2, FiEdit2, FiList, FiGrid, FiX } from 'react-icons/fi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 mb-3 relative group text-left">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.type === 'Delivery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
          {task.type}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
            task.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
          }`}>
          {task.priority} Priority
        </span>
      </div>

      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {task.device?.name}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Customer: <span className="font-medium text-slate-700 dark:text-slate-350">{task.customer?.name}</span>
      </p>

      <div className="space-y-1.5 mt-2 border-t border-slate-100 dark:border-slate-700/50 pt-2.5">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <FiMapPin className="mr-2 flex-shrink-0 text-slate-400" />
          <span className="truncate">{task.location_address}</span>
        </div>
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <FiClock className="mr-2 flex-shrink-0 text-slate-400" />
          <span>{new Date(task.scheduled_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
        {task.estimated_duration_mins && (
          <div className="text-[10px] text-slate-400 pl-6">
            Est. Duration: {task.estimated_duration_mins} mins
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
        <div className="flex items-center min-w-0">
          {task.assigned_staff ? (
            <>
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold mr-1.5 flex-shrink-0">
                {task.assigned_staff.name.charAt(0)}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">{task.assigned_staff.name}</span>
            </>
          ) : (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center">
              <FiAlertCircle className="mr-1" /> Unassigned
            </span>
          )}
        </div>
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit Task"
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Delete Task"
          >
            <FiTrash2 size={13} />
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FiMoreVertical size={13} />
          </button>

          {showOptions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
              <div className="absolute right-0 bottom-6 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20 text-xs overflow-hidden">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">Set Status</div>
                {['Pending', 'Assigned', 'InProgress', 'Completed', 'Delayed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onStatusChange(task.id, st);
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${task.status === st ? 'text-primary-600 font-semibold bg-primary-50/20 dark:bg-primary-950/20' : 'text-slate-650 dark:text-slate-300'
                      }`}
                  >
                    {st === 'InProgress' ? 'In Progress' : st}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BoardColumn = ({ title, status, tasks, icon, colorClass, onEdit, onDelete, onStatusChange }) => (
  <div className="flex flex-col bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 h-full w-[340px] flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center">
        <div className={`p-1.5 rounded-lg text-white mr-2 shadow-sm ${colorClass}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</h3>
      </div>
      <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-150 dark:border-slate-600">
        {tasks.length}
      </span>
    </div>
    <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
      {tasks.length === 0 && (
        <div className="h-24 border-2 border-dashed border-slate-350 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-medium">
          No tasks
        </div>
      )}
    </div>
  </div>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form states
  const [formType, setFormType] = useState('Delivery');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDeviceId, setFormDeviceId] = useState('');
  const [deviceSearchText, setDeviceSearchText] = useState('');
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formPriority, setFormPriority] = useState('Medium');
  const [formScheduledTime, setFormScheduledTime] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formLocation, setFormLocation] = useState('');
  const [formStaffId, setFormStaffId] = useState('auto'); // 'auto' or ID
  const [formNotes, setFormNotes] = useState('');

  // Set formDeviceId whenever selectedDevice changes
  useEffect(() => {
    if (selectedDevice) {
      setFormDeviceId(selectedDevice.isNew ? 'new' : selectedDevice.id.toString());
    } else {
      setFormDeviceId('');
    }
  }, [selectedDevice]);

  // Clash states
  const [clashWarning, setClashWarning] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchAllData = async () => {
    try {
      const [taskRes, staffRes, customerRes, deviceRes, conflictRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/staff'),
        api.get('/customers'),
        api.get('/devices'),
        api.get('/tasks/conflicts')
      ]);
      setTasks(taskRes.data);
      setStaffs(staffRes.data);
      setCustomers(customerRes.data);
      setDevices(deviceRes.data);
      setConflicts(conflictRes.data);
    } catch (error) {
      console.error('Error fetching tasks page data:', error);
      showToast('Failed to load page data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Check clash when staff or time is changed
  useEffect(() => {
    const checkClashRealtime = async () => {
      if (!formScheduledTime || formStaffId === 'auto' || formStaffId === '') {
        setClashWarning(null);
        return;
      }
      try {
        const res = await api.post('/tasks/check-clash', {
          assigned_staff_id: formStaffId,
          scheduled_time: formScheduledTime,
          estimated_duration_mins: parseInt(formDuration)
        });
        if (res.data.hasClash) {
          const conflictingStaff = staffs.find(s => s.id === parseInt(formStaffId))?.name || 'Staff member';
          setClashWarning(`${conflictingStaff} is already booked around this time!`);
        } else {
          setClashWarning(null);
        }
      } catch (error) {
        console.error('Error checking clash:', error);
      }
    };

    checkClashRealtime();
  }, [formStaffId, formScheduledTime, formDuration, staffs]);

  const handleDeviceSelect = (d) => {
    setSelectedDevice(d);
    setDeviceSearchText(d.name);
    setIsDeviceDropdownOpen(false);
  };

  const handleAddCustomDevice = (name) => {
    setSelectedDevice({ isNew: true, name });
    setDeviceSearchText(name);
    setIsDeviceDropdownOpen(false);
  };

  const handleDeviceDropdownClose = () => {
    setIsDeviceDropdownOpen(false);
    const trimmed = deviceSearchText.trim();
    if (!trimmed) {
      setSelectedDevice(null);
      return;
    }
    
    // Check if exactly matches an existing device name
    const match = devices.find(d => d.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      setSelectedDevice(match);
      setDeviceSearchText(match.name);
    } else {
      setSelectedDevice({ isNew: true, name: trimmed });
    }
  };

  const handleDeviceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = deviceSearchText.trim();
      if (trimmed) {
        const match = devices.find(d => d.name.toLowerCase() === trimmed.toLowerCase());
        if (match) {
          handleDeviceSelect(match);
        } else {
          handleAddCustomDevice(trimmed);
        }
      }
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormType('Delivery');
    setFormCustomerId(customers[0]?.id || '');
    setFormDeviceId('');
    setDeviceSearchText('');
    setSelectedDevice(null);
    setFormPriority('Medium');
    // Default scheduled time to tomorrow same hour rounded
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    setFormScheduledTime(tomorrow.toISOString().slice(0, 16));
    setFormDuration('60');
    setFormLocation('');
    setFormStaffId('auto');
    setFormNotes('');
    setClashWarning(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormType(task.type);
    setFormCustomerId(task.customer_id.toString());
    setFormDeviceId(task.device_id.toString());
    const dev = devices.find(d => d.id === task.device_id) || task.device;
    if (dev) {
      setSelectedDevice(dev);
      setDeviceSearchText(dev.name);
    } else {
      setSelectedDevice(null);
      setDeviceSearchText('');
    }
    setFormPriority(task.priority);
    // Convert to local datetime string format required by input
    const localTime = new Date(task.scheduled_time);
    const tzOffset = localTime.getTimezoneOffset() * 60000; // in ms
    const localISO = new Date(localTime.getTime() - tzOffset).toISOString().slice(0, 16);
    setFormScheduledTime(localISO);
    setFormDuration(task.estimated_duration_mins?.toString() || '60');
    setFormLocation(task.location_address);
    setFormStaffId(task.assigned_staff_id ? task.assigned_staff_id.toString() : 'auto');
    setFormNotes(task.notes || '');
    setClashWarning(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task status updated to ${newStatus}`);
      fetchAllData();
    } catch (error) {
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      showToast('Task deleted successfully');
      fetchAllData();
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formCustomerId || (!selectedDevice && !deviceSearchText.trim()) || !formScheduledTime || !formLocation) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    let finalDeviceId = selectedDevice && !selectedDevice.isNew ? selectedDevice.id : null;

    if (!finalDeviceId) {
      const deviceName = selectedDevice?.name || deviceSearchText.trim();
      try {
        // Create new device on the fly
        const sn = `SN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const deviceRes = await api.post('/devices', {
          name: deviceName,
          category: 'General',
          serial_number: sn,
          rental_price: 100.0,
          availability_status: 'Available',
          condition: 'Excellent'
        });
        finalDeviceId = deviceRes.data.id;
        
        // Add to local state
        setDevices(prev => [...prev, deviceRes.data]);
      } catch (error) {
        showToast('Failed to create custom device', 'error');
        return;
      }
    }

    const payload = {
      type: formType,
      customer_id: parseInt(formCustomerId),
      device_id: finalDeviceId,
      priority: formPriority,
      scheduled_time: new Date(formScheduledTime).toISOString(),
      estimated_duration_mins: parseInt(formDuration),
      location_address: formLocation,
      assigned_staff_id: formStaffId === 'auto' ? null : parseInt(formStaffId),
      notes: formNotes
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        showToast('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        showToast('Task created successfully');
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (error) {
      const errMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save task';
      showToast(errMsg, 'error');
    }
  };

  // Filter devices based on search text
  const filteredDevicesForForm = devices.filter(d => {
    return d.name.toLowerCase().includes(deviceSearchText.toLowerCase());
  });

  const exactDeviceMatchExists = devices.some(d => d.name.toLowerCase() === deviceSearchText.toLowerCase().trim());

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks Board</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage, coordinate, and track pickups and deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === 'board' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
            >
              <FiGrid /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
            >
              <FiList /> List
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30"
          >
            <FiPlus className="mr-2" /> New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total tasks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">{tasks.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{tasks.filter((t) => t.status === 'Pending').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-purple-600">{tasks.filter((t) => t.status === 'InProgress').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conflicts</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{conflicts.length}</p>
        </div>
      </div>

      {/* Schedule Conflicts Alerts */}
      {conflicts.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/50">
          <h3 className="text-amber-800 dark:text-amber-300 font-bold flex items-center text-sm mb-2">
            <FiAlertCircle className="mr-2 text-amber-500" /> Schedule Conflicts Detected ({conflicts.length})
          </h3>
          <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-400 space-y-1">
            {conflicts.map((c, i) => (
              <li key={i}><strong>{c.staff}</strong> is double-booked: {c.task1} &amp; {c.task2}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center text-slate-500 py-12">Loading tasks...</div>
      ) : viewMode === 'board' ? (
        /* Board view (scrollable Kanban) */
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 select-none flex-1 min-h-0 items-stretch">
          <BoardColumn
            title="Pending"
            status="Pending"
            tasks={tasks.filter(t => t.status === 'Pending')}
            icon={<FiAlertCircle className="w-4 h-4" />}
            colorClass="bg-slate-500"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="Assigned"
            status="Assigned"
            tasks={tasks.filter(t => t.status === 'Assigned')}
            icon={<FiPlus className="w-4 h-4" />}
            colorClass="bg-blue-500"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="In Progress"
            status="InProgress"
            tasks={tasks.filter(t => t.status === 'InProgress')}
            icon={<FiTruck className="w-4 h-4" />}
            colorClass="bg-purple-500"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="Completed"
            status="Completed"
            tasks={tasks.filter(t => t.status === 'Completed')}
            icon={<FiCheckCircle className="w-4 h-4" />}
            colorClass="bg-emerald-500"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="Delayed"
            status="Delayed"
            tasks={tasks.filter(t => t.status === 'Delayed')}
            icon={<FiClock className="w-4 h-4" />}
            colorClass="bg-rose-500"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <BoardColumn
            title="Cancelled"
            status="Cancelled"
            tasks={tasks.filter(t => t.status === 'Cancelled')}
            icon={<FiX className="w-4 h-4" />}
            colorClass="bg-slate-400"
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : (
        /* List view (table format) */
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-250 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="p-4">Type</th>
                  <th className="p-4">Device</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Scheduled Time</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">No tasks found.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${task.type === 'Delivery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                          {task.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{task.device?.name}</td>
                      <td className="p-4 text-slate-650 dark:text-slate-350">{task.customer?.name}</td>
                      <td className="p-4 text-slate-650 dark:text-slate-350">
                        {task.assigned_staff ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-[9px] font-bold flex items-center justify-center">
                              {task.assigned_staff.name.charAt(0)}
                            </span>
                            <span>{task.assigned_staff.name}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(task.scheduled_time).toLocaleString()}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`font-semibold ${task.priority === 'High' ? 'text-rose-500' :
                            task.priority === 'Medium' ? 'text-amber-500' :
                              'text-emerald-500'
                          }`}>{task.priority}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary-500"
                        >
                          {['Pending', 'Assigned', 'InProgress', 'Completed', 'Delayed', 'Cancelled'].map((st) => (
                            <option key={st} value={st}>{st === 'InProgress' ? 'In Progress' : st}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary-600 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable Modal for Task Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task Details' : 'Schedule New Logistics Task'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          {/* Clash Alert banner in Modal */}
          {clashWarning && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300">
              <FiAlertCircle className="text-rose-500 flex-shrink-0" size={16} />
              <span>{clashWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Task Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Delivery">Delivery (Renting out)</option>
                <option value="Pickup">Pickup (Return device)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Customer *</label>
            <select
              value={formCustomerId}
              onChange={(e) => setFormCustomerId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="" disabled>Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Device *</label>
            <div className="relative">
              <input
                type="text"
                value={deviceSearchText}
                onChange={(e) => {
                  setDeviceSearchText(e.target.value);
                  setIsDeviceDropdownOpen(true);
                  setSelectedDevice(null);
                }}
                onFocus={() => setIsDeviceDropdownOpen(true)}
                onKeyDown={handleDeviceKeyDown}
                placeholder="Search or type any device name..."
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              {deviceSearchText && (
                <button
                  type="button"
                  onClick={() => {
                    setDeviceSearchText('');
                    setSelectedDevice(null);
                    setIsDeviceDropdownOpen(true);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            
            {isDeviceDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => handleDeviceDropdownClose()} />
                <ul className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredDevicesForForm.map(d => (
                    <li
                      key={d.id}
                      onClick={() => handleDeviceSelect(d)}
                      className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-150">{d.name}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded ml-2 uppercase font-semibold">
                          {d.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        d.availability_status === 'Available'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {d.availability_status}
                      </span>
                    </li>
                  ))}
                  
                  {deviceSearchText.trim() && !exactDeviceMatchExists && (
                    <li
                      onClick={() => handleAddCustomDevice(deviceSearchText.trim())}
                      className="px-3 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-semibold cursor-pointer flex items-center transition-colors border-t border-slate-100 dark:border-slate-700"
                    >
                      <FiPlus className="mr-2 text-primary-500" /> Create Custom Device: "{deviceSearchText.trim()}"
                    </li>
                  )}
                  
                  {filteredDevicesForForm.length === 0 && !deviceSearchText.trim() && (
                    <li className="px-3 py-4 text-xs text-center text-slate-400 dark:text-slate-500 italic">
                      Type to search or add custom device
                    </li>
                  )}
                </ul>
              </>
            )}

            {selectedDevice && (
              <div className="mt-1.5 flex items-center gap-1.5">
                {selectedDevice.isNew ? (
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50 flex items-center">
                    ✨ New Device (Will be auto-created)
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    ✓ Existing Device
                  </span>
                )}
              </div>
            )}
            
            {filteredDevicesForForm.length === 0 && deviceSearchText.trim() === '' && (
              <span className="text-[10px] text-amber-500 mt-1 block">💡 No devices in stock. Type to create a custom device.</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Scheduled Time *</label>
              <input
                type="datetime-local"
                value={formScheduledTime}
                onChange={(e) => setFormScheduledTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Est. Duration (Mins)</label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                min="10"
                max="480"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Location Address *</label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="e.g. 123 Business Rd, Building B"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Staff Assignment</label>
            <select
              value={formStaffId}
              onChange={(e) => setFormStaffId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="auto">🤖 Auto-Assign (Least Busy Available Staff)</option>
              {staffs.map(s => {
                const hasOtherActiveTasks = s.tasks && s.tasks.some(t => !editingTask || t.id !== editingTask.id);
                const status = hasOtherActiveTasks ? 'Unavailable' : (s.staffDetails?.availability_status || 'Offline');
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({status})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes / Instructions</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Any special handling instructions..."
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {editingTask ? 'Save Changes' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast alert rendering */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'success' })}
      />
    </div>
  );
};

export default Tasks;
