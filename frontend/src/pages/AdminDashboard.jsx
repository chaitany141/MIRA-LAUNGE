import { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  // Mock data
  const bookings = [
    { id: 'BKG-101', user: 'Rahul Sharma', date: 'Oct 15, 2026', total: 1500000, advance: 375000, status: 'Pending' },
    { id: 'BKG-102', user: 'Priya Verma', date: 'Nov 02, 2026', total: 2000000, advance: 500000, status: 'Approved' },
    { id: 'BKG-103', user: 'Amit Kumar', date: 'Nov 20, 2026', total: 1200000, advance: 300000, status: 'Rejected' },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-2xl font-heading text-mira-gold mb-6 px-4">Admin Panel</h2>
          {['bookings', 'packages', 'gallery', 'revenue'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-md capitalize transition-colors ${
                activeTab === tab ? 'bg-mira-gold text-mira-black font-semibold' : 'text-gray-400 hover:bg-mira-dark hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-6 min-h-[500px]">
          {activeTab === 'bookings' && (
            <div>
              <h3 className="text-2xl font-heading text-white mb-6">Manage Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300 border-collapse">
                  <thead>
                    <tr className="border-b border-mira-gold/20 text-mira-gold">
                      <th className="p-4">ID</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total (₹)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-mira-gold/10 hover:bg-mira-dark/50 transition-colors">
                        <td className="p-4">{b.id}</td>
                        <td className="p-4">{b.user}</td>
                        <td className="p-4">{b.date}</td>
                        <td className="p-4">{b.total.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            b.status === 'Approved' ? 'bg-green-900/50 text-green-400' :
                            b.status === 'Rejected' ? 'bg-red-900/50 text-red-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 space-x-2">
                          <button className="text-green-400 hover:underline">Approve</button>
                          <button className="text-red-400 hover:underline">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div>
               <h3 className="text-2xl font-heading text-white mb-6">Manage Packages</h3>
               <button className="btn-outline-gold mb-6">Add New Package</button>
               <p className="text-gray-400">Package management UI goes here.</p>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
               <h3 className="text-2xl font-heading text-white mb-6">Manage Gallery</h3>
               <button className="btn-outline-gold mb-6">Upload Image</button>
               <p className="text-gray-400">Gallery upload UI goes here.</p>
            </div>
          )}

          {activeTab === 'revenue' && (
             <div>
                <h3 className="text-2xl font-heading text-white mb-6">Revenue Analytics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="bg-mira-dark p-6 rounded-lg border border-mira-gold/20">
                      <p className="text-gray-400 mb-2">Total Revenue</p>
                      <p className="text-3xl font-heading text-mira-gold">₹35,00,000</p>
                   </div>
                   <div className="bg-mira-dark p-6 rounded-lg border border-mira-gold/20">
                      <p className="text-gray-400 mb-2">Pending Advance</p>
                      <p className="text-3xl font-heading text-yellow-500">₹8,75,000</p>
                   </div>
                   <div className="bg-mira-dark p-6 rounded-lg border border-mira-gold/20">
                      <p className="text-gray-400 mb-2">Refunds Issued</p>
                      <p className="text-3xl font-heading text-red-400">₹3,00,000</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
