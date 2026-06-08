import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiMail, FiPhone, FiStar } from 'react-icons/fi';

const StaffCard = ({ staff }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-inner">
          {staff.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">{staff.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{staff.role}</p>
        </div>
      </div>
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
        staff.staffDetails?.availability_status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
        staff.staffDetails?.availability_status === 'On Duty' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
      }`}>
        {staff.staffDetails?.availability_status || 'Unknown'}
      </span>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
        <FiPhone className="mr-2 text-slate-400" /> {staff.staffDetails?.phone || 'N/A'}
      </div>
      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
        <FiMail className="mr-2 text-slate-400" /> <span className="truncate">{staff.email}</span>
      </div>
    </div>
    
    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Active Tasks:</span>
        <span className={`text-sm font-bold ${staff.tasks?.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {staff.tasks?.length || 0}
        </span>
      </div>
      <div className="flex items-center">
        <FiStar className="text-amber-400 w-4 h-4 fill-current mr-1" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">4.8</span>
      </div>
    </div>
  </div>
);

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/staff');
        setStaffList(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage delivery personnel, coordinators, and track availability.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30">
          <FiPlus className="mr-2" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Loading staff data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staffList.map((staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Staff;
