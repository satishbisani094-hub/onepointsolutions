import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiBarChart2, FiDownload, FiCheckCircle, FiClock, FiCpu, FiPrinter, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Reports = () => {
  const [data, setData] = useState({
    summary: { totalDeliveries: 0, activePickups: 0, delayedTasks: 0, completedToday: 0 },
    pieData: [],
    weeklyData: [],
    staffUtilization: [],
    deviceUtilization: { total: 0, rented: 0, available: 0, maintenance: 0 },
    onTimeRate: 100
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const devicePieData = [
    { name: 'Available', value: data.deviceUtilization.available, color: '#10b981' },
    { name: 'Rented', value: data.deviceUtilization.rented, color: '#3b82f6' },
    { name: 'Maintenance', value: data.deviceUtilization.maintenance, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['On-time delivery rate', `${data.onTimeRate}%`],
      ['Active rentals', data.deviceUtilization.rented],
      ['Delayed tasks', data.summary.delayedTasks],
      ['Total deliveries', data.summary.totalDeliveries],
      ['Active pickups', data.summary.activePickups],
      ['Completed today', data.summary.completedToday]
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'onepoint-solutions-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <FiBarChart2 className="mr-3 text-primary-500" />
            Analytics & Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Deep dive into logistics performance and utilization metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCsv}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <FiDownload className="mr-2" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            <FiPrinter className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading reports...</div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-100 font-medium mb-1">On-Time Delivery Rate</p>
                  <h3 className="text-4xl font-bold">{data.onTimeRate}%</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-400/30 text-sm text-emerald-50">
                Performance across all completed tasks
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 font-medium mb-1">Total Active Rentals</p>
                  <h3 className="text-4xl font-bold">{data.deviceUtilization.rented}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiCpu className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400/30 text-sm text-blue-50">
                Out of {data.deviceUtilization.total} total devices
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-rose-100 font-medium mb-1">Delayed Logistics</p>
                  <h3 className="text-4xl font-bold">{data.summary.delayedTasks}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FiClock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-rose-400/30 text-sm text-rose-50">
                Tasks past their scheduled deadline
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Staff Utilization Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                <FiUsers className="mr-2 text-primary-500" /> Staff Utilization (Active Tasks)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.staffUtilization} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="activeTasks" name="Active Tasks" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Status Pie Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center">
                <FiCpu className="mr-2 text-primary-500" /> Device Availability Breakdown
              </h3>
              <div className="flex-1 min-h-[250px] flex items-center justify-center">
                {devicePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devicePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {devicePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-sm">No device data</div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {devicePieData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Delivery Volume (Line Chart) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mt-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Delivery Volume Trend (Past 7 Days)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="deliveries" name="Deliveries" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pickups" name="Pickups" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
