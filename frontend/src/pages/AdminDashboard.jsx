import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error('Not logged in. Please login first.');
      }

      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
      
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${status.toLowerCase()} booking`);
      
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

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
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          {activeTab === 'bookings' && (
            <div>
              <h3 className="text-2xl font-heading text-white mb-6">Manage Bookings</h3>
              {isLoading ? (
                <p className="text-gray-400">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-400">No bookings found.</p>
              ) : (
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
                        <tr key={b._id} className="border-b border-mira-gold/10 hover:bg-mira-dark/50 transition-colors">
                          <td className="p-4 text-sm">{b._id.substring(0, 8)}...</td>
                          <td className="p-4">{b.user_id?.name || 'Unknown'}</td>
                          <td className="p-4">{new Date(b.date).toLocaleDateString()}</td>
                          <td className="p-4">{b.total_cost?.toLocaleString() || 0}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              b.booking_status === 'Approved' ? 'bg-green-900/50 text-green-400' :
                              b.booking_status === 'Rejected' ? 'bg-red-900/50 text-red-400' :
                              'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {b.booking_status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 space-x-2">
                            {b.booking_status === 'Pending' && (
                              <>
                                <button onClick={() => handleStatusUpdate(b._id, 'Approved')} className="text-green-400 hover:underline">Approve</button>
                                <button onClick={() => handleStatusUpdate(b._id, 'Rejected')} className="text-red-400 hover:underline">Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
