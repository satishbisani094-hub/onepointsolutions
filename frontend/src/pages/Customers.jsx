import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiSearch, FiPhone, FiMail, FiMapPin, FiExternalLink } from 'react-icons/fi';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage corporate clients and event organizers.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm shadow-primary-500/30">
          <FiPlus className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400" />
            </div>
            <input 
              type="text" 
              className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors" 
              placeholder="Search customers..." 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading customers...</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {customers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center">
                      {customer.name}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                      <FiMapPin className="mr-1.5" /> {customer.address}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 block text-xs mb-0.5">Contact Email</span>
                    {customer.email}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center"><FiPhone className="mr-2 text-slate-400" /> {customer.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-6 md:pl-6 md:border-l border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 leading-none">
                      {customer.tasks?.filter(t => t.status !== 'Completed').length || 0}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 leading-none">
                      {customer.tasks?.length || 0}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">Total</div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary-600 bg-slate-100 hover:bg-primary-50 dark:bg-slate-700 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                    <FiExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
