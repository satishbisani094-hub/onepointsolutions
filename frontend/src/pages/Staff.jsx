import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPlus, FiMail, FiPhone, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const StaffCard = ({ staff, onEdit, onDelete, onAvailabilityChange }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-all group flex flex-col justify-between text-left">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white flex items-center justify-center text-lg font-bold shadow-inner flex-shrink-0">
              {staff.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">{staff.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{staff.role}</p>
            </div>
          </div>
          
          <div className="relative">
            <select
              value={staff.staffDetails?.availability_status || 'Available'}
              onChange={(e) => onAvailabilityChange(staff.id, e.target.value)}
              className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 border-0 focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer ${
                staff.staffDetails?.availability_status === 'Available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                staff.staffDetails?.availability_status === 'On Duty' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                'bg-slate-100 text-slate-650 dark:bg-slate-700/50 dark:text-slate-400'
              }`}
            >
              <option value="Available">Available</option>
              <option value="On Duty">On Duty</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-3">
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-350">
            <FiPhone className="mr-2 text-slate-400 flex-shrink-0" /> 
            <span>{staff.staffDetails?.phone || 'No phone number'}</span>
          </div>
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-350">
            <FiMail className="mr-2 text-slate-400 flex-shrink-0" /> 
            <span className="truncate">{staff.email}</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xs text-slate-450 dark:text-slate-400 mr-1.5">Active Tasks:</span>
          <span className={`text-xs font-bold ${staff.tasks?.length > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {staff.tasks?.length || 0}
          </span>
        </div>
        <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(staff)}
            className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit Staff Details"
          >
            <FiEdit2 size={13} />
          </button>
          <button 
            onClick={() => onDelete(staff.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Remove Staff"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('DeliveryStaff');
  const [formStatus, setFormStatus] = useState('Available');

  // Toast notifications
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaffList(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showToast('Failed to fetch staff data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('DeliveryStaff');
    setFormStatus('Available');
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPhone(staff.staffDetails?.phone || '');
    setFormRole(staff.role);
    setFormStatus(staff.staffDetails?.availability_status || 'Available');
    setIsModalOpen(true);
  };

  const handleAvailabilityChange = async (userId, newStatus) => {
    try {
      await api.put(`/staff/${userId}/availability`, { availability_status: newStatus });
      showToast('Availability status updated');
      fetchStaff();
    } catch (error) {
      showToast('Failed to update availability', 'error');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      showToast('Staff member removed successfully');
      fetchStaff();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to remove staff member';
      showToast(msg, 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formName || !formEmail) {
      showToast('Please fill out Name and Email fields', 'warning');
      return;
    }

    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      availability_status: formStatus
    };

    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, payload);
        showToast('Staff member details updated');
      } else {
        await api.post('/staff', payload);
        showToast('Staff member added successfully');
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to save staff member';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage logistics staff, assignments, and availability.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30"
        >
          <FiPlus className="mr-2" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Loading staff data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staffList.map((staff) => (
            <StaffCard 
              key={staff.id} 
              staff={staff} 
              onEdit={openEditModal}
              onDelete={handleDeleteStaff}
              onAvailabilityChange={handleAvailabilityChange}
            />
          ))}
          {staffList.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No staff members found. Add one to get started.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStaff ? 'Edit Staff Member' : 'Add Logistics Staff Member'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address *</label>
            <input 
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. john@onepoint.com"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
            <input 
              type="text"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Role</label>
              <select 
                value={formRole} 
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="DeliveryStaff">Delivery Staff</option>
                <option value="Coordinator">Logistics Coordinator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</label>
              <select 
                value={formStatus} 
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
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
              {editingStaff ? 'Save Changes' : 'Add Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast alert */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: null, type: 'success' })} 
      />
    </div>
  );
};

export default Staff;
