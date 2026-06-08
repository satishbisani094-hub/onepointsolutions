import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPackage, FiTruck, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
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

// Dummy data for bar chart since we don't have historical weekly data in DB yet
const weeklyData = [
  { name: 'Mon', deliveries: 12, pickups: 8 },
  { name: 'Tue', deliveries: 19, pickups: 15 },
  { name: 'Wed', deliveries: 15, pickups: 10 },
  { name: 'Thu', deliveries: 22, pickups: 18 },
  { name: 'Fri', deliveries: 28, pickups: 20 },
  { name: 'Sat', deliveries: 10, pickups: 5 },
  { name: 'Sun', deliveries: 5, pickups: 2 },
];

const Dashboard = () => {
  const [data, setData] = useState({
    summary: { totalDeliveries: 0, activePickups: 0, delayedTasks: 0, completedToday: 0 },
    pieData: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-500/30">
          Generate Report
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Weekly Performance</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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

        {/* Task Status Pie Chart */}
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

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 mt-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Logistics Activities</h3>
        <div className="space-y-4">
          {data.recentActivities.length > 0 ? data.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
              <div className={`p-2 rounded-lg mt-0.5 mr-4 ${
                activity.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                activity.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {activity.type === 'success' ? <FiCheckCircle className="w-5 h-5" /> : 
                 activity.type === 'warning' ? <FiAlertCircle className="w-5 h-5" /> :
                 <FiClock className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.desc}</p>
              </div>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{activity.time}</span>
            </div>
          )) : (
            <div className="text-slate-500 text-sm py-4 text-center">No recent activities</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
