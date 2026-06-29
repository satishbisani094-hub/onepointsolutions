import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api, { getDbViewerUrl } from '../utils/api';
import { FiPackage, FiTruck, FiAlertCircle, FiCheckCircle, FiClock, FiUsers, FiCpu, FiDatabase, FiUser, FiBox, FiClipboard } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, colorClass, trend }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`}></div>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-sm`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <span className="text-emerald-500 font-medium">{trend}</span>
        <span className="text-slate-400 ml-2">vs last week</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    summary: { totalDeliveries: 0, activePickups: 0, delayedTasks: 0, completedToday: 0 },
    pieData: [],
    weeklyData: [],
    staffUtilization: [],
    deviceUtilization: { total: 0, rented: 0, available: 0, maintenance: 0 },
    onTimeRate: 100,
    recentActivities: []
  });
  const [dbStats, setDbStats] = useState({
    users: 0,
    customers: 0,
    devices: 0,
    tasks: 0,
    notifications: 0,
    activityLogs: 0
  });
  const [dbData, setDbData] = useState({
    users: [],
    customers: [],
    devices: [],
    tasks: [],
    notifications: [],
    activityLogs: []
  });
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDb, setLoadingDb] = useState(true);

  const fetchMainData = async () => {
    try {
      const [analyticsRes, conflictsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/tasks/conflicts')
      ]);
      setData(analyticsRes.data);
      setConflicts(conflictsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard main data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbViewerData = async () => {
    try {
      const dbViewerRes = await axios.get(getDbViewerUrl());
      const dbRaw = dbViewerRes?.data || {};
      setDbData({
        users: dbRaw.users || [],
        customers: dbRaw.customers || [],
        devices: dbRaw.devices || [],
        tasks: dbRaw.tasks || [],
        notifications: dbRaw.notifications || [],
        activityLogs: dbRaw.activityLogs || []
      });
      setDbStats({
        users: (dbRaw.users || []).length,
        customers: (dbRaw.customers || []).length,
        devices: (dbRaw.devices || []).length,
        tasks: (dbRaw.tasks || []).length,
        notifications: (dbRaw.notifications || []).length,
        activityLogs: (dbRaw.activityLogs || []).length
      });
    } catch (error) {
      console.error('Error fetching DB viewer data:', error);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchData = () => {
    fetchMainData();
    fetchDbViewerData();
  };

  useEffect(() => {
    fetchData();
    // Poll dashboard analytics every 30 seconds
    const interval = setInterval(fetchMainData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">OnePoint Solutions Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live operations view for deliveries, pickups, staff availability, and inventory from the Express + Prisma backend.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/tasks')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Manage Tasks
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-500/30"
          >
            View Full Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-primary-600 via-primary-500 to-cyan-500 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">Operations snapshot</p>
          <h2 className="mt-3 text-2xl font-semibold">Keep the entire logistics workflow moving in one place.</h2>
          <p className="mt-3 max-w-2xl text-sm text-primary-50/90">
            Review active tasks, device availability, staff utilization, and recent activity from your connected PostgreSQL data source.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <p className="text-primary-100">Open tasks</p>
              <p className="mt-1 text-xl font-semibold">{data.summary.pendingTasks + data.summary.inProgressTasks}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <p className="text-primary-100">Devices in service</p>
              <p className="mt-1 text-xl font-semibold">{data.deviceUtilization.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Quick actions</h3>
          <div className="mt-4 space-y-3 text-sm">
            <button onClick={() => navigate('/tasks')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <span>Review task board</span>
              <span className="text-primary-500">→</span>
            </button>
            <button onClick={() => navigate('/inventory')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <span>Inspect inventory</span>
              <span className="text-primary-500">→</span>
            </button>
            <button onClick={() => navigate('/staff')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <span>Check staff availability</span>
              <span className="text-primary-500">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Conflicts Alert Banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-3 text-amber-800 dark:text-amber-300">
          <FiAlertCircle className="w-5 h-5 mt-0.5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Scheduling Clashes Detected ({conflicts.length})</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Some staff members have been double-booked. Please reassign overlapping tasks on the task board.
            </p>
            <div className="mt-2 space-y-1">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div key={index} className="text-xs font-mono bg-amber-100/50 dark:bg-amber-950/40 px-2 py-1 rounded">
                  <strong>{conflict.staff}</strong>: {conflict.task1} vs {conflict.task2}
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline flex-shrink-0 mt-2 sm:mt-0"
          >
            Fix Clashes
          </button>
        </div>
      )}

      {/* Delayed Tasks Alert Section */}
      {data.summary.delayedTasks > 0 && (
        <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 rounded-2xl p-4 flex items-start gap-3 text-rose-800 dark:text-rose-300">
          <FiClock className="w-5 h-5 mt-0.5 text-rose-500 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Delayed Tasks Outstanding ({data.summary.delayedTasks})</h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              There are {data.summary.delayedTasks} task(s) past their scheduled times that are still incomplete.
            </p>
          </div>
          <button 
            onClick={() => navigate('/tasks')}
            className="text-xs font-semibold text-rose-800 dark:text-rose-300 hover:underline flex-shrink-0"
          >
            Manage Tasks
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live database snapshot</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <FiUser className="w-4 h-4" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
                {loadingDb ? (
                  <span className="inline-block animate-pulse w-8 h-6 bg-slate-250 dark:bg-slate-700 rounded" />
                ) : (
                  dbStats.users
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <FiUsers className="w-4 h-4" />
                <span className="text-sm font-medium">Customers</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
                {loadingDb ? (
                  <span className="inline-block animate-pulse w-8 h-6 bg-slate-250 dark:bg-slate-700 rounded" />
                ) : (
                  dbStats.customers
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <FiBox className="w-4 h-4" />
                <span className="text-sm font-medium">Devices</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
                {loadingDb ? (
                  <span className="inline-block animate-pulse w-8 h-6 bg-slate-250 dark:bg-slate-700 rounded" />
                ) : (
                  dbStats.devices
                )}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <FiClipboard className="w-4 h-4" />
                <span className="text-sm font-medium">Tasks</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
                {loadingDb ? (
                  <span className="inline-block animate-pulse w-8 h-6 bg-slate-250 dark:bg-slate-700 rounded" />
                ) : (
                  dbStats.tasks
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Deliveries" 
          value={data.summary.totalDeliveries} 
          icon={<FiPackage className="w-6 h-6" />} 
          colorClass="from-blue-500 to-cyan-500"
        />
        <StatCard 
          title="Active Pickups" 
          value={data.summary.activePickups} 
          icon={<FiTruck className="w-6 h-6" />} 
          colorClass="from-purple-500 to-indigo-500"
        />
        <StatCard 
          title="Delayed Tasks" 
          value={data.summary.delayedTasks} 
          icon={<FiAlertCircle className="w-6 h-6" />} 
          colorClass="from-red-500 to-rose-500"
        />
        <StatCard 
          title="Completed Today" 
          value={data.summary.completedToday} 
          icon={<FiCheckCircle className="w-6 h-6" />} 
          colorClass="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Weekly Performance</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="deliveries" name="Deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pickups" name="Pickups" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Task Status</h3>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {data.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No tasks available</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data.pieData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & Device Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Utilization Cards */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-6">
            <FiUsers className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Staff Status & Tasks</h3>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {data.staffUtilization.length > 0 ? (
              data.staffUtilization.map((s, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5 font-medium ${
                        s.availability === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        s.availability === 'On Duty' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {s.availability}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.activeTasks} active tasks</p>
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-primary-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (s.activeTasks / 5) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No staff members assigned</p>
            )}
          </div>
        </div>

        {/* Device Quick Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-6">
            <FiCpu className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Device Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/20 text-center">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">{data.deviceUtilization.available}</span>
              <span className="text-xs text-emerald-800/80 dark:text-emerald-400 font-medium">Available</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 dark:bg-blue-950/10 dark:border-blue-900/20 text-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 block">{data.deviceUtilization.rented}</span>
              <span className="text-xs text-blue-800/80 dark:text-blue-400 font-medium">Rented</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 dark:bg-amber-950/10 dark:border-amber-900/20 text-center">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block">{data.deviceUtilization.maintenance}</span>
              <span className="text-xs text-amber-800/80 dark:text-amber-400 font-medium">Maintenance</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 dark:bg-slate-900/50 dark:border-slate-800 text-center">
              <span className="text-2xl font-bold text-slate-600 dark:text-slate-400 block">{data.deviceUtilization.total}</span>
              <span className="text-xs text-slate-800/80 dark:text-slate-400 font-medium">Total Inventory</span>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/20 border border-slate-100 dark:border-slate-750 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">On-Time Delivery Rate</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data.onTimeRate}%</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Logistics Activities</h3>
        <div className="space-y-4">
          {data.recentActivities && data.recentActivities.length > 0 ? (
            data.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className={`p-2 rounded-lg mt-0.5 mr-4 ${
                  activity.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  activity.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {activity.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : 
                   activity.type === 'warning' ? <FiAlertCircle className="w-5 h-5" /> :
                   <FiClock className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.desc}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">{activity.time}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm py-4 text-center">No recent activities</div>
          )}
        </div>
      </div>

      {/* Full Data Explorer */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Full Data Explorer</h3>
          </div>
          {loadingDb ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-sm font-medium">Loading database explorer...</p>
            </div>
          ) : (
            <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Users ({dbStats.users})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.users.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{user.id}</td>
                        <td className="px-4 py-3">{user.name || '-'}</td>
                        <td className="px-4 py-3">{user.email || '-'}</td>
                        <td className="px-4 py-3">{user.role || '-'}</td>
                        <td className="px-4 py-3">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                    {dbData.users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No users available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Customers ({dbStats.customers})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.customers.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.customers.map((customer) => (
                      <tr key={customer.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{customer.id}</td>
                        <td className="px-4 py-3">{customer.name || '-'}</td>
                        <td className="px-4 py-3">{customer.phone || '-'}</td>
                        <td className="px-4 py-3">{customer.email || '-'}</td>
                        <td className="px-4 py-3">{customer.address || '-'}</td>
                      </tr>
                    ))}
                    {dbData.customers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No customers available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Devices ({dbStats.devices})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.devices.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Serial</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.devices.map((device) => (
                      <tr key={device.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{device.id}</td>
                        <td className="px-4 py-3">{device.name || '-'}</td>
                        <td className="px-4 py-3">{device.category || '-'}</td>
                        <td className="px-4 py-3">{device.serial_number || '-'}</td>
                        <td className="px-4 py-3">{device.availability_status || '-'}</td>
                        <td className="px-4 py-3">{device.rental_price != null ? `$${device.rental_price}` : '-'}</td>
                      </tr>
                    ))}
                    {dbData.devices.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-slate-500">No devices available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tasks ({dbStats.tasks})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.tasks.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Scheduled</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Device</th>
                      <th className="px-4 py-3">Staff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.tasks.map((task) => (
                      <tr key={task.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{task.id}</td>
                        <td className="px-4 py-3">{task.type || '-'}</td>
                        <td className="px-4 py-3">{task.status || '-'}</td>
                        <td className="px-4 py-3">{task.priority || '-'}</td>
                        <td className="px-4 py-3">{task.scheduled_time ? new Date(task.scheduled_time).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3">{task.customer?.name || task.customer_id || '-'}</td>
                        <td className="px-4 py-3">{task.device?.name || task.device_id || '-'}</td>
                        <td className="px-4 py-3">{task.assigned_staff?.name || task.assigned_staff?.email || 'Unassigned'}</td>
                      </tr>
                    ))}
                    {dbData.tasks.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-6 text-center text-slate-500">No tasks available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications ({dbStats.notifications})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.notifications.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Read</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.notifications.map((note) => (
                      <tr key={note.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{note.id}</td>
                        <td className="px-4 py-3">{note.message || '-'}</td>
                        <td className="px-4 py-3">{note.is_read ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">{note.created_at ? new Date(note.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                    {dbData.notifications.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-slate-500">No notifications available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activity Logs ({dbStats.activityLogs})</h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">{dbData.activityLogs.length} records</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.activityLogs.map((log) => (
                      <tr key={log.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{log.id}</td>
                        <td className="px-4 py-3">{log.action || '-'}</td>
                        <td className="px-4 py-3">{log.entity_type || '-'}</td>
                        <td className="px-4 py-3">{log.user || log.user_id || '-'}</td>
                        <td className="px-4 py-3">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                    {dbData.activityLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-slate-500">No activity logs available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
