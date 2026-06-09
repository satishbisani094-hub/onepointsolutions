import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiClock, FiX } from 'react-icons/fi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formRentalPrice, setFormRentalPrice] = useState('0');
  const [formStatus, setFormStatus] = useState('Available');
  const [formCondition, setFormCondition] = useState('Good');
  
  // Toast notifications
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get('/devices');
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showToast('Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openCreateModal = () => {
    setEditingDevice(null);
    setFormName('');
    setFormCategory('Laptops');
    setFormSerialNumber('');
    setFormRentalPrice('100');
    setFormStatus('Available');
    setFormCondition('Good');
    setIsModalOpen(true);
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setFormName(device.name);
    setFormCategory(device.category);
    setFormSerialNumber(device.serial_number);
    setFormRentalPrice(device.rental_price.toString());
    setFormStatus(device.availability_status);
    setFormCondition(device.condition);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device from inventory?')) return;
    try {
      await api.delete(`/devices/${id}`);
      showToast('Device deleted successfully');
      fetchInventory();
    } catch (error) {
      showToast('Failed to delete device. It might be linked to a task.', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formName || !formSerialNumber || !formRentalPrice) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    const payload = {
      name: formName,
      category: formCategory,
      serial_number: formSerialNumber,
      rental_price: parseFloat(formRentalPrice),
      availability_status: formStatus,
      condition: formCondition
    };

    try {
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.id}`, payload);
        showToast('Device updated successfully');
      } else {
        await api.post('/devices', payload);
        showToast('Device added successfully');
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      showToast('Failed to save device. Check if serial number is unique.', 'error');
    }
  };

  // Get unique categories for filters
  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  const statuses = ['All', 'Available', 'Rented', 'Maintenance'];

  // Client-side search and filtering
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.serial_number.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || item.availability_status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Device Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage rental devices, rental prices, and tracking statuses.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30"
        >
          <FiPlus className="mr-2" /> Add Device
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Search & Filter Trigger */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors" 
              placeholder="Search by device name or serial number..." 
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || filterCategory !== 'All' || filterStatus !== 'All'
                ? 'bg-primary-50 dark:bg-primary-950/20 border-primary-300 text-primary-600 dark:text-primary-400'
                : 'border-slate-350 dark:border-slate-650 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <FiFilter className="mr-2" /> Filter
          </button>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Availability Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading inventory...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4">Device Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Serial No.</th>
                  <th className="px-6 py-4">Price/Day</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No devices match the query.</td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Condition: <span className="font-semibold text-slate-600 dark:text-slate-300">{item.condition}</span></div>
                      </td>
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-300">{item.category}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{item.serial_number}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">${item.rental_price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.availability_status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          item.availability_status === 'Rented' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.availability_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary-600 transition-colors"
                            title="Edit Device"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleDeleteDevice(item.id)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete Device"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Device Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDevice ? 'Edit Device Details' : 'Add New Inventory Device'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Device Name *</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. MacBook Pro M3 Max"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select 
                value={formCategory} 
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Laptops">Laptops</option>
                <option value="Projectors">Projectors</option>
                <option value="Audio">Audio</option>
                <option value="Screens">Screens</option>
                <option value="Cameras">Cameras</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Condition</label>
              <select 
                value={formCondition} 
                onChange={(e) => setFormCondition(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Serial Number *</label>
              <input 
                type="text"
                value={formSerialNumber}
                onChange={(e) => setFormSerialNumber(e.target.value)}
                placeholder="e.g. MBP-3829-X01"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Rental Price / Day ($) *</label>
              <input 
                type="number"
                value={formRentalPrice}
                onChange={(e) => setFormRentalPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Availability Status</label>
            <select 
              value={formStatus} 
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
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
              {editingDevice ? 'Save Changes' : 'Add Device'}
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

export default Inventory;
