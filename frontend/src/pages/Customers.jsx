import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPlus, FiSearch, FiPhone, FiMail, FiMapPin, FiExternalLink, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // Toast notifications
  const [toast, setToast] = useState({ message: null, type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormPhone(customer.phone);
    setFormEmail(customer.email || '');
    setFormAddress(customer.address);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      showToast('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to delete customer. Ensure they have no active tasks.';
      showToast(msg, 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formName || !formPhone || !formAddress) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    const payload = {
      name: formName,
      phone: formPhone,
      email: formEmail,
      address: formAddress
    };

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
        showToast('Customer updated successfully');
      } else {
        await api.post('/customers', payload);
        showToast('Customer added successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      const errMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to save customer';
      showToast(errMsg, 'error');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const term = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      customer.phone.includes(term) ||
      customer.address.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage corporate clients, event organizers, and rental history.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30"
        >
          <FiPlus className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total customers</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-white">
            {loading ? (
              <span className="inline-block animate-pulse w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mt-1" />
            ) : (
              customers.length
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With active tasks</p>
          <p className="mt-2 text-2xl font-semibold text-primary-600">
            {loading ? (
              <span className="inline-block animate-pulse w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mt-1" />
            ) : (
              customers.filter((customer) => (customer.tasks || []).some((task) => task.status !== 'Completed' && task.status !== 'Cancelled')).length
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search matches</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {loading ? (
              <span className="inline-block animate-pulse w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mt-1" />
            ) : (
              filteredCustomers.length
            )}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors" 
              placeholder="Search customers by name, phone, email, or address..." 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No customers found.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group relative">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 border border-primary-200 dark:border-primary-800/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl flex-shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-white flex items-center leading-tight">
                        {customer.name}
                      </h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-start">
                        <FiMapPin className="mr-1.5 mt-0.5 flex-shrink-0" /> 
                        <span className="leading-snug">{customer.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm ml-[72px] md:ml-0 md:pl-6 border-slate-200 dark:border-slate-700/50 md:border-l">
                    <div className="text-slate-650 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Contact Email</span>
                      <div className="flex items-center">
                        <FiMail className="mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{customer.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-slate-650 dark:text-slate-300">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Phone</span>
                      <div className="flex items-center">
                        <FiPhone className="mr-2 text-slate-400 flex-shrink-0" /> 
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end w-full md:w-auto gap-5 md:pl-8 border-slate-200 dark:border-slate-700/50 md:border-l">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 leading-none">
                        {customer.tasks?.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 leading-none">
                        {customer.tasks?.length || 0}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Total</div>
                    </div>

                    {/* Actions Dropdown / Icons */}
                    <div className="flex items-center gap-1.5 ml-4">
                      <button 
                        onClick={() => openEditModal(customer)}
                        className="p-2 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="Edit Customer"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Company / Individual Name *</label>
            <input 
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number *</label>
              <input 
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +1 555-1234"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
              <input 
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. contact@acme.com"
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Address *</label>
            <input 
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. 123 Business Rd, Tech Park"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
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
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: null, type: 'success' })} 
      />
    </div>
  );
};

export default Customers;
