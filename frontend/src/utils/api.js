import bcrypt from 'bcryptjs';

// Initial Mock Seed Data matching the seed.js configurations
const initialUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@onepoint.com',
    password_hash: '$2b$10$txqRQKiwPjxM2qfHD/V4cevF3dtsyiXzvYTa63i8GnFdKUMXavoi6', // matches 'admin123'
    role: 'Admin',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Mike Johnson',
    email: 'mike.j@onepoint.com',
    password_hash: '$2b$10$6qljaXPtD7kwljUAwMIzN.tJj0aK1DOZ8dHPYK1lMpP2HwdXE34Ki', // matches 'defaulthash'
    role: 'DeliveryStaff',
    staffDetails: {
      phone: '+1 234 567 8901',
      availability_status: 'On Duty',
      current_location: 'Warehouse A'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Sarah Williams',
    email: 'sarah.w@onepoint.com',
    password_hash: '$2b$10$Siqnid3TXvseVRBrDi1JEe7PgEktYxcdWE.27lzElPlTkzo1R3FCe', // matches 'defaulthash'
    role: 'DeliveryStaff',
    staffDetails: {
      phone: '+1 234 567 8902',
      availability_status: 'Available',
      current_location: 'Downtown Hub'
    },
    created_at: new Date().toISOString()
  }
];

const initialCustomers = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    phone: '+1 555 123 4567',
    email: 'jane@techcorp.com',
    address: 'Downtown Business Park',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'EventMasters Inc.',
    phone: '+1 555 987 6543',
    email: 'robert@eventmasters.com',
    address: 'Westside Convention Center',
    created_at: new Date().toISOString()
  }
];

const initialDevices = [
  {
    id: 1,
    name: 'MacBook Pro M2 16"',
    category: 'Laptops',
    serial_number: 'MBP-2023-001',
    rental_price: 150,
    availability_status: 'Available',
    condition: 'Excellent',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Epson Pro L1070U',
    category: 'Projectors',
    serial_number: 'EPS-PRJ-042',
    rental_price: 200,
    availability_status: 'Rented',
    condition: 'Good',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'JBL EON612 PA System',
    category: 'Audio',
    serial_number: 'JBL-PA-015',
    rental_price: 80,
    availability_status: 'Available',
    condition: 'Good',
    created_at: new Date().toISOString()
  }
];

const initialTasks = [
  {
    id: 1,
    type: 'Delivery',
    status: 'Assigned',
    priority: 'High',
    scheduled_time: new Date().toISOString(),
    estimated_duration_mins: 60,
    location_address: 'Tech Park, Building A',
    notes: 'Urgent delivery for conference',
    customer_id: 1,
    device_id: 1,
    assigned_staff_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    type: 'Pickup',
    status: 'Pending',
    priority: 'Medium',
    scheduled_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    estimated_duration_mins: 60,
    location_address: 'Downtown Conf Center',
    notes: 'Standard pickup',
    customer_id: 2,
    device_id: 2,
    assigned_staff_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialNotifications = [
  {
    id: 1,
    user_id: 1,
    type: 'Assignment',
    message: 'Task assigned to Mike Johnson',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

// Helper to get/set localStorage
const getLocalStorage = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper to simulate asynchronous HTTP requests
const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, 150);
  });
};

const simulateError = (status, errorMsg, details = '') => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(errorMsg);
      error.response = {
        status,
        data: { error: errorMsg, details }
      };
      reject(error);
    }, 150);
  });
};

// Collision/Clash Detection logic
const detectConflicts = (tasks, users) => {
  const conflicts = [];
  const activeTasks = tasks.filter(t => t.assigned_staff_id !== null && ['Pending', 'Assigned', 'InProgress'].includes(t.status));
  
  const staffTasks = {};
  activeTasks.forEach(t => {
    if (!staffTasks[t.assigned_staff_id]) staffTasks[t.assigned_staff_id] = [];
    staffTasks[t.assigned_staff_id].push(t);
  });

  Object.keys(staffTasks).forEach(staffId => {
    const tList = staffTasks[staffId];
    const staffName = users.find(u => u.id === parseInt(staffId))?.name || 'Staff';
    for (let i = 0; i < tList.length; i++) {
      for (let j = i + 1; j < tList.length; j++) {
        const t1 = tList[i];
        const t2 = tList[j];
        const time1 = new Date(t1.scheduled_time).getTime();
        const time2 = new Date(t2.scheduled_time).getTime();
        
        // 2 hours window conflict detection
        if (Math.abs(time1 - time2) < 2 * 3600000) {
          conflicts.push({
            staff: staffName,
            task1: `${t1.type} (#${t1.id})`,
            task2: `${t2.type} (#${t2.id})`
          });
        }
      }
    }
  });
  return conflicts;
};

// Auto Assign Staff
const autoAssignStaff = (scheduledTime) => {
  const users = getLocalStorage('ops_users', initialUsers);
  const tasks = getLocalStorage('ops_tasks', initialTasks);
  const staff = users.filter(u => u.role === 'DeliveryStaff' && u.staffDetails?.availability_status === 'Available');
  if (staff.length === 0) return null;
  
  const staffWithCounts = staff.map(s => {
    const activeCount = tasks.filter(t => t.assigned_staff_id === s.id && ['Pending', 'Assigned', 'InProgress'].includes(t.status)).length;
    return { id: s.id, count: activeCount };
  });
  
  staffWithCounts.sort((a, b) => a.count - b.count);
  return staffWithCounts[0].id;
};

// Create custom device
const createCustomDevice = (name) => {
  const devices = getLocalStorage('ops_devices', initialDevices);
  const newDevice = {
    id: Date.now(),
    name,
    category: 'Custom',
    serial_number: `CST-${Date.now().toString().slice(-6)}`,
    rental_price: 50.0,
    availability_status: 'Rented',
    condition: 'Good',
    created_at: new Date().toISOString()
  };
  devices.push(newDevice);
  setLocalStorage('ops_devices', devices);
  return newDevice.id;
};

// Calculate analytics dashboard stats
const getAnalyticsDashboard = (tasks, users, devices) => {
  const totalDeliveries = tasks.filter(t => t.type === 'Delivery').length;
  const activePickups = tasks.filter(t => t.type === 'Pickup' && t.status !== 'Completed').length;
  const delayedTasks = tasks.filter(t => t.status === 'Delayed').length;
  
  const todayStr = new Date().toDateString();
  const completedToday = tasks.filter(t => t.status === 'Completed' && new Date(t.updated_at).toDateString() === todayStr).length;
  
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;

  const statuses = ['Pending', 'Assigned', 'InProgress', 'Completed', 'Delayed', 'Cancelled'];
  const colors = {
    'Completed': '#10b981',
    'InProgress': '#3b82f6',
    'Pending': '#f59e0b',
    'Delayed': '#ef4444',
    'Assigned': '#8b5cf6',
    'Cancelled': '#64748b'
  };
  const pieData = statuses.map(st => ({
    name: st,
    value: tasks.filter(t => t.status === st).length,
    color: colors[st]
  })).filter(d => d.value > 0);

  const weeklyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayTasks = tasks.filter(t => new Date(t.scheduled_time).toDateString() === dateStr);
    
    weeklyData.push({
      name: dayNames[d.getDay()],
      deliveries: dayTasks.filter(t => t.type === 'Delivery').length,
      pickups: dayTasks.filter(t => t.type === 'Pickup').length
    });
  }

  const staff = users.filter(u => u.role === 'DeliveryStaff' || u.role === 'Coordinator');
  const staffUtilization = staff.map(s => {
    const active = tasks.filter(t => t.assigned_staff_id === s.id && ['Pending', 'Assigned', 'InProgress'].includes(t.status));
    return {
      name: s.name,
      activeTasks: active.length,
      availability: s.staffDetails?.availability_status || 'Available'
    };
  });

  const totalDevices = devices.length;
  const rentedDevices = devices.filter(d => d.availability_status === 'Rented').length;
  const availableDevices = devices.filter(d => d.availability_status === 'Available').length;
  const maintenanceDevices = devices.filter(d => d.availability_status === 'Maintenance').length;

  const completed = tasks.filter(t => t.status === 'Completed');
  const onTime = completed.filter(t => {
    if (!t.actual_time) return true;
    return new Date(t.actual_time) <= new Date(new Date(t.scheduled_time).getTime() + 30 * 60000);
  });
  const onTimeRate = completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 100;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);
  const recentActivities = recentTasks.map(t => {
    const staffUser = users.find(u => u.id === t.assigned_staff_id);
    const customer = getLocalStorage('ops_customers', initialCustomers).find(c => c.id === t.customer_id);
    return {
      id: t.id,
      title: `${t.type} ${t.status}`,
      desc: `${t.type} for ${customer?.name || 'N/A'} is currently ${t.status}.${staffUser ? ` Assigned to ${staffUser.name}.` : ''}`,
      time: new Date(t.updated_at).toLocaleString(),
      type: t.status === 'Completed' ? 'success' : t.status === 'Delayed' ? 'warning' : 'info'
    };
  });

  return {
    summary: { totalDeliveries, activePickups, delayedTasks, completedToday, totalTasks, pendingTasks, inProgressTasks },
    pieData,
    weeklyData,
    staffUtilization,
    deviceUtilization: { total: totalDevices, rented: rentedDevices, available: availableDevices, maintenance: maintenanceDevices },
    onTimeRate,
    recentActivities
  };
};

// Simulated Axios Instance
const api = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },

  get: async (url, config) => {
    const users = getLocalStorage('ops_users', initialUsers);
    const customers = getLocalStorage('ops_customers', initialCustomers);
    const devices = getLocalStorage('ops_devices', initialDevices);
    const tasks = getLocalStorage('ops_tasks', initialTasks);
    const notifications = getLocalStorage('ops_notifications', initialNotifications);

    if (url === '/notifications') {
      return simulateNetwork(notifications);
    }
    if (url === '/notifications/unread-count') {
      const count = notifications.filter(n => !n.is_read).length;
      return simulateNetwork({ count });
    }
    if (url === '/tasks') {
      const mapped = tasks.map(t => ({
        ...t,
        customer: customers.find(c => c.id === t.customer_id),
        device: devices.find(d => d.id === t.device_id),
        assigned_staff: users.find(u => u.id === t.assigned_staff_id)
      }));
      return simulateNetwork(mapped);
    }
    if (url === '/staff') {
      const staffList = users.filter(u => u.role === 'DeliveryStaff' || u.role === 'Coordinator');
      const mapped = staffList.map(s => {
        const activeTasks = tasks.filter(t => t.assigned_staff_id === s.id && ['Pending', 'Assigned', 'InProgress'].includes(t.status));
        return {
          ...s,
          tasks: activeTasks
        };
      });
      return simulateNetwork(mapped);
    }
    if (url === '/customers') {
      return simulateNetwork(customers);
    }
    if (url === '/devices') {
      return simulateNetwork(devices);
    }
    if (url === '/tasks/conflicts') {
      const conflicts = detectConflicts(tasks, users);
      return simulateNetwork(conflicts);
    }
    if (url === '/analytics/dashboard') {
      const analytics = getAnalyticsDashboard(tasks, users, devices);
      return simulateNetwork(analytics);
    }
    
    return simulateError(404, 'Not Found');
  },

  post: async (url, data) => {
    const users = getLocalStorage('ops_users', initialUsers);
    const customers = getLocalStorage('ops_customers', initialCustomers);
    const devices = getLocalStorage('ops_devices', initialDevices);
    const tasks = getLocalStorage('ops_tasks', initialTasks);
    const notifications = getLocalStorage('ops_notifications', initialNotifications);

    if (url === '/auth/login') {
      const { email, password } = data;
      const user = users.find(u => u.email === email);
      if (!user) {
        return simulateError(401, 'Invalid email or password');
      }
      
      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(password, user.password_hash);
      } catch (err) {
        isMatch = (password === user.password_hash);
      }
      
      if (!isMatch) {
        return simulateError(401, 'Invalid email or password');
      }
      if (user.role !== 'Admin') {
        return simulateError(403, 'Access denied. Only Admins can access this portal.');
      }
      return simulateNetwork({
        token: 'mock-jwt-token-admin',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }

    if (url === '/tasks') {
      let resolvedDeviceId = data.device_id;
      if (data.device_id === 'new' && data.deviceSearchText) {
        resolvedDeviceId = createCustomDevice(data.deviceSearchText);
      } else {
        resolvedDeviceId = parseInt(data.device_id);
      }

      const newTask = {
        id: Date.now(),
        type: data.type,
        status: data.status || 'Pending',
        priority: data.priority || 'Medium',
        scheduled_time: data.scheduled_time,
        location_address: data.location_address,
        notes: data.notes || '',
        customer_id: parseInt(data.customer_id),
        device_id: resolvedDeviceId,
        assigned_staff_id: data.assigned_staff_id === 'auto' ? autoAssignStaff(data.scheduled_time) : (data.assigned_staff_id ? parseInt(data.assigned_staff_id) : null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (typeof newTask.device_id === 'number') {
        const devIdx = devices.findIndex(d => d.id === newTask.device_id);
        if (devIdx !== -1) {
          devices[devIdx].availability_status = 'Rented';
          setLocalStorage('ops_devices', devices);
        }
      }

      tasks.push(newTask);
      setLocalStorage('ops_tasks', tasks);

      if (newTask.assigned_staff_id) {
        const staffName = users.find(u => u.id === newTask.assigned_staff_id)?.name;
        notifications.unshift({
          id: Date.now() + 1,
          user_id: 1,
          type: 'Assignment',
          message: `Task assigned to ${staffName}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        setLocalStorage('ops_notifications', notifications);
      }

      return simulateNetwork(newTask);
    }

    if (url === '/tasks/check-clash') {
      const { assigned_staff_id, scheduled_time, estimated_duration_mins } = data;
      const staffId = parseInt(assigned_staff_id);
      const newTime = new Date(scheduled_time).getTime();
      const newDuration = (estimated_duration_mins || 60) * 60000;

      const hasClash = tasks.some(t => {
        if (t.assigned_staff_id !== staffId || ['Completed', 'Cancelled'].includes(t.status)) {
          return false;
        }
        const tTime = new Date(t.scheduled_time).getTime();
        const tDuration = (t.estimated_duration_mins || 60) * 60000;
        
        return Math.abs(tTime - newTime) < (tDuration + newDuration) / 2;
      });

      return simulateNetwork({ hasClash });
    }

    if (url === '/devices') {
      const newDevice = {
        id: Date.now(),
        name: data.name,
        category: data.category,
        serial_number: data.serial_number,
        rental_price: parseFloat(data.rental_price),
        availability_status: data.availability_status || 'Available',
        condition: data.condition || 'Good',
        created_at: new Date().toISOString()
      };
      devices.push(newDevice);
      setLocalStorage('ops_devices', devices);
      return simulateNetwork(newDevice);
    }

    if (url === '/customers') {
      const newCustomer = {
        id: Date.now(),
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address,
        created_at: new Date().toISOString()
      };
      customers.push(newCustomer);
      setLocalStorage('ops_customers', customers);
      return simulateNetwork(newCustomer);
    }

    if (url === '/staff') {
      const newStaff = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        password_hash: bcrypt.hashSync('defaulthash', 10),
        role: data.role || 'DeliveryStaff',
        staffDetails: {
          phone: data.phone || '',
          availability_status: data.availability_status || 'Available',
          current_location: ''
        }
      };
      users.push(newStaff);
      setLocalStorage('ops_users', users);
      return simulateNetwork(newStaff);
    }

    return simulateError(404, 'Not Found');
  },

  put: async (url, data) => {
    const users = getLocalStorage('ops_users', initialUsers);
    const customers = getLocalStorage('ops_customers', initialCustomers);
    const devices = getLocalStorage('ops_devices', initialDevices);
    const tasks = getLocalStorage('ops_tasks', initialTasks);
    const notifications = getLocalStorage('ops_notifications', initialNotifications);

    if (url.startsWith('/tasks/') && url.endsWith('/status')) {
      const parts = url.split('/');
      const taskId = parseInt(parts[2]);
      const statusIdx = tasks.findIndex(t => t.id === taskId);
      if (statusIdx !== -1) {
        tasks[statusIdx].status = data.status;
        tasks[statusIdx].updated_at = new Date().toISOString();
        setLocalStorage('ops_tasks', tasks);
        return simulateNetwork(tasks[statusIdx]);
      }
      return simulateError(404, 'Task not found');
    }

    if (url.startsWith('/tasks/')) {
      const parts = url.split('/');
      const taskId = parseInt(parts[2]);
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        tasks[idx] = {
          ...tasks[idx],
          type: data.type || tasks[idx].type,
          priority: data.priority || tasks[idx].priority,
          scheduled_time: data.scheduled_time || tasks[idx].scheduled_time,
          location_address: data.location_address || tasks[idx].location_address,
          notes: data.notes !== undefined ? data.notes : tasks[idx].notes,
          customer_id: data.customer_id ? parseInt(data.customer_id) : tasks[idx].customer_id,
          device_id: data.device_id ? parseInt(data.device_id) : tasks[idx].device_id,
          assigned_staff_id: data.assigned_staff_id === 'auto' ? autoAssignStaff(data.scheduled_time) : (data.assigned_staff_id ? parseInt(data.assigned_staff_id) : null),
          updated_at: new Date().toISOString()
        };
        setLocalStorage('ops_tasks', tasks);
        return simulateNetwork(tasks[idx]);
      }
      return simulateError(404, 'Task not found');
    }

    if (url.startsWith('/devices/')) {
      const parts = url.split('/');
      const deviceId = parseInt(parts[2]);
      const idx = devices.findIndex(d => d.id === deviceId);
      if (idx !== -1) {
        devices[idx] = {
          ...devices[idx],
          name: data.name || devices[idx].name,
          category: data.category || devices[idx].category,
          serial_number: data.serial_number || devices[idx].serial_number,
          rental_price: data.rental_price ? parseFloat(data.rental_price) : devices[idx].rental_price,
          availability_status: data.availability_status || devices[idx].availability_status,
          condition: data.condition || devices[idx].condition
        };
        setLocalStorage('ops_devices', devices);
        return simulateNetwork(devices[idx]);
      }
      return simulateError(404, 'Device not found');
    }

    if (url.startsWith('/customers/')) {
      const parts = url.split('/');
      const customerId = parseInt(parts[2]);
      const idx = customers.findIndex(c => c.id === customerId);
      if (idx !== -1) {
        customers[idx] = {
          ...customers[idx],
          name: data.name || customers[idx].name,
          phone: data.phone || customers[idx].phone,
          email: data.email || customers[idx].email,
          address: data.address || customers[idx].address
        };
        setLocalStorage('ops_customers', customers);
        return simulateNetwork(customers[idx]);
      }
      return simulateError(404, 'Customer not found');
    }

    if (url.startsWith('/staff/') && url.endsWith('/availability')) {
      const parts = url.split('/');
      const staffId = parseInt(parts[2]);
      const idx = users.findIndex(u => u.id === staffId);
      if (idx !== -1) {
        if (!users[idx].staffDetails) users[idx].staffDetails = {};
        users[idx].staffDetails.availability_status = data.availability_status;
        setLocalStorage('ops_users', users);
        return simulateNetwork(users[idx].staffDetails);
      }
      return simulateError(404, 'Staff not found');
    }

    if (url.startsWith('/staff/')) {
      const parts = url.split('/');
      const staffId = parseInt(parts[2]);
      const idx = users.findIndex(u => u.id === staffId);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          name: data.name || users[idx].name,
          email: data.email || users[idx].email,
          role: data.role || users[idx].role
        };
        if (!users[idx].staffDetails) users[idx].staffDetails = {};
        users[idx].staffDetails.phone = data.phone !== undefined ? data.phone : users[idx].staffDetails.phone;
        users[idx].staffDetails.availability_status = data.availability_status || users[idx].staffDetails.availability_status;
        
        setLocalStorage('ops_users', users);
        return simulateNetwork(users[idx]);
      }
      return simulateError(404, 'Staff not found');
    }

    if (url.startsWith('/notifications/') && url.endsWith('/read')) {
      const parts = url.split('/');
      const notifId = parseInt(parts[2]);
      const idx = notifications.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        notifications[idx].is_read = true;
        setLocalStorage('ops_notifications', notifications);
        return simulateNetwork(notifications[idx]);
      }
      return simulateError(404, 'Notification not found');
    }

    if (url === '/notifications/read-all') {
      notifications.forEach(n => n.is_read = true);
      setLocalStorage('ops_notifications', notifications);
      return simulateNetwork({ success: true });
    }

    return simulateError(404, 'Not Found');
  },

  delete: async (url) => {
    const users = getLocalStorage('ops_users', initialUsers);
    const customers = getLocalStorage('ops_customers', initialCustomers);
    const devices = getLocalStorage('ops_devices', initialDevices);
    const tasks = getLocalStorage('ops_tasks', initialTasks);

    if (url.startsWith('/tasks/')) {
      const parts = url.split('/');
      const taskId = parseInt(parts[2]);
      const filtered = tasks.filter(t => t.id !== taskId);
      setLocalStorage('ops_tasks', filtered);
      return simulateNetwork({ success: true });
    }

    if (url.startsWith('/devices/')) {
      const parts = url.split('/');
      const deviceId = parseInt(parts[2]);
      const filtered = devices.filter(d => d.id !== deviceId);
      setLocalStorage('ops_devices', filtered);
      return simulateNetwork({ success: true });
    }

    if (url.startsWith('/customers/')) {
      const parts = url.split('/');
      const customerId = parseInt(parts[2]);
      const filteredCustomers = customers.filter(c => c.id !== customerId);
      setLocalStorage('ops_customers', filteredCustomers);
      
      const filteredTasks = tasks.filter(t => t.customer_id !== customerId);
      setLocalStorage('ops_tasks', filteredTasks);
      return simulateNetwork({ success: true });
    }

    if (url.startsWith('/staff/')) {
      const parts = url.split('/');
      const staffId = parseInt(parts[2]);
      
      const active = tasks.filter(t => t.assigned_staff_id === staffId && ['Pending', 'Assigned', 'InProgress'].includes(t.status));
      if (active.length > 0) {
        return simulateError(400, 'Cannot delete staff with active tasks. Reassign tasks first.');
      }

      const filteredUsers = users.filter(u => u.id !== staffId);
      setLocalStorage('ops_users', filteredUsers);
      return simulateNetwork({ success: true });
    }

    return simulateError(404, 'Not Found');
  }
};

export default api;
