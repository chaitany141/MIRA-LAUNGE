import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const navigate = useNavigate();

  // Check if admin is logged in on mount
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token && userInfo.role === 'admin') {
      setIsAdminLoggedIn(true);
      fetchBookings(userInfo.token);
    } else {
      setIsAdminLoggedIn(false);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.role !== 'admin') {
        throw new Error('Access Denied: You are not authorized as an admin.');
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsAdminLoggedIn(true);
      fetchBookings(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAdminLoggedIn(false);
    setBookings([]);
    setError('');
  };

  const fetchBookings = async (token) => {
    let authToken = token;
    if (!authToken) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      authToken = userInfo?.token;
    }

    if (!authToken) return;

    try {
      setIsLoading(true);
      setError('');
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
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

  const handleStatusUpdate = async (id, status) => {
    setStatusUpdatingId(id);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('Unauthorized');

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
      
      alert(`Booking has been ${status === 'Approved' ? 'Accepted' : 'Declined'} successfully! Email notification has been sent to the user.`);
      fetchBookings(userInfo.token);
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const toggleExpandBooking = (id) => {
    if (expandedBookingId === id) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(id);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="py-24 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-mira-gold mb-4">Admin Portal</h1>
          <p className="text-gray-300">Authorized personnel only</p>
        </div>

        <div className="glass-card p-8">
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Admin Email</label>
              <input 
                required 
                type="email" 
                value={loginForm.email} 
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} 
                className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" 
                placeholder="admin@miralounge.com" 
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Password</label>
              <input 
                required 
                type="password" 
                value={loginForm.password} 
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
                className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" 
                placeholder="••••••••" 
              />
            </div>
            <button type="submit" disabled={loginLoading} className="btn-gold w-full mt-4 flex justify-center">
              {loginLoading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8 border-b border-mira-gold/20 pb-4">
        <div>
          <h1 className="text-4xl font-heading text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Logged in as Administrator</p>
        </div>
        <button onClick={handleLogout} className="btn-outline-gold px-4 py-2 text-xs">
          Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-2 flex-shrink-0">
          {['bookings', 'packages', 'gallery', 'revenue'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-md capitalize transition-all ${
                activeTab === tab ? 'bg-mira-gold text-mira-black font-semibold shadow-lg shadow-mira-gold/20' : 'text-gray-400 hover:bg-mira-dark hover:text-white'
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading text-white">Manage Bookings</h3>
                <button onClick={() => fetchBookings()} className="text-mira-gold hover:underline text-sm">Refresh List</button>
              </div>
              {isLoading ? (
                <p className="text-gray-400">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-400">No bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-gray-300 border-collapse">
                    <thead>
                      <tr className="border-b border-mira-gold/20 text-mira-gold text-sm">
                        <th className="p-4">ID</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Event Date</th>
                        <th className="p-4">Total Cost (₹)</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {bookings.map(b => (
                        <React.Fragment key={b._id}>
                          <tr className="border-b border-mira-gold/10 hover:bg-mira-dark/30 transition-colors">
                            <td className="p-4 font-mono text-xs text-gray-500">
                              #{b._id.substring(b._id.length - 8)}
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-white">{b.user_id?.name || 'Unknown User'}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{b.user_id?.email || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{b.user_id?.phone || 'N/A'}</div>
                            </td>
                            <td className="p-4">
                              {new Date(b.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="p-4 font-medium text-white">
                              ₹{b.total_cost?.toLocaleString() || 0}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                b.payment_method === 'Online' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/20' : 'bg-orange-900/50 text-orange-300 border border-orange-500/20'
                              }`}>
                                {b.payment_method}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                b.booking_status === 'Approved' ? 'bg-green-900/50 text-green-400 border border-green-500/20' :
                                b.booking_status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-500/20' :
                                b.booking_status === 'Cancelled' ? 'bg-gray-800 text-gray-400' :
                                'bg-yellow-900/50 text-yellow-400 border border-yellow-500/20'
                              }`}>
                                {b.booking_status || 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 space-x-2 text-center">
                              {b.booking_status === 'Pending' ? (
                                <div className="flex gap-2 justify-center">
                                  <button 
                                    disabled={statusUpdatingId === b._id}
                                    onClick={() => handleStatusUpdate(b._id, 'Approved')} 
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    disabled={statusUpdatingId === b._id}
                                    onClick={() => handleStatusUpdate(b._id, 'Rejected')} 
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-xs">Closed</span>
                              )}
                              <button 
                                onClick={() => toggleExpandBooking(b._id)}
                                className="text-mira-gold hover:text-white text-xs mt-2 block mx-auto underline"
                              >
                                {expandedBookingId === b._id ? 'Hide Details' : 'View Details'}
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Details Row */}
                          {expandedBookingId === b._id && (
                            <tr>
                              <td colSpan="7" className="bg-mira-dark/30 p-6 border-b border-mira-gold/10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                                  <div>
                                    <h4 className="text-mira-gold font-semibold mb-2 uppercase tracking-wider text-xs">Event Details</h4>
                                    <p className="text-sm"><span className="text-gray-500">Guests:</span> {b.guest_count} guests</p>
                                    <p className="text-sm mt-1"><span className="text-gray-500">Advance Paid (25%):</span> ₹{b.advance_paid?.toLocaleString()}</p>
                                    <p className="text-sm mt-1"><span className="text-gray-500">Payment Status:</span> 
                                      <span className={`ml-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                                        b.payment_status === 'Completed' ? 'bg-green-900/50 text-green-400' :
                                        b.payment_status === 'Refunded' ? 'bg-red-900/50 text-red-400' :
                                        'bg-yellow-900/50 text-yellow-400'
                                      }`}>
                                        {b.payment_status}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-mira-gold font-semibold mb-2 uppercase tracking-wider text-xs">Packages Configured</h4>
                                    <p className="text-sm"><span className="text-gray-500">Catering:</span> {b.catering_package?.name || 'N/A'}</p>
                                    <p className="text-sm mt-1"><span className="text-gray-500">Decoration:</span> {b.decoration_package?.name || 'N/A'}</p>
                                    {b.addons && b.addons.length > 0 ? (
                                      <p className="text-sm mt-1">
                                        <span className="text-gray-500">Add-ons:</span> {b.addons.map(addon => addon.name).join(', ')}
                                      </p>
                                    ) : (
                                      <p className="text-sm mt-1"><span className="text-gray-500">Add-ons:</span> None</p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-mira-gold font-semibold mb-2 uppercase tracking-wider text-xs">System Info</h4>
                                    <p className="text-xs font-mono text-gray-500">Database ID: {b._id}</p>
                                    {b.razorpay_order_id && (
                                      <p className="text-xs font-mono text-gray-500 mt-1">Razorpay Order ID: {b.razorpay_order_id}</p>
                                    )}
                                    {b.razorpay_payment_id && (
                                      <p className="text-xs font-mono text-gray-500 mt-1">Razorpay Payment ID: {b.razorpay_payment_id}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
               <p className="text-gray-400">Default packages have been seeded in the database. Use this tab to inspect them:</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                 {packages.length > 0 ? (
                   packages.map(p => (
                     <div key={p._id} className="p-4 bg-mira-dark rounded border border-mira-gold/20 flex gap-4">
                       {p.image && <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded border border-mira-gold/20" />}
                       <div>
                         <span className="text-[10px] px-2 py-0.5 rounded bg-mira-gold text-mira-black font-semibold uppercase">{p.type}</span>
                         <h4 className="font-semibold text-white mt-1">{p.name}</h4>
                         <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                         <p className="text-mira-gold font-medium mt-1">₹{p.price.toLocaleString()}{p.type === 'Catering' ? '/plate' : ''}</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-gray-400">Loading seeded packages...</p>
                 )}
               </div>
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
                      <p className="text-gray-400 mb-2">Total Approved Revenue</p>
                      <p className="text-3xl font-heading text-mira-gold">
                        ₹{bookings.filter(b => b.booking_status === 'Approved').reduce((acc, b) => acc + b.total_cost, 0).toLocaleString()}
                      </p>
                   </div>
                   <div className="bg-mira-dark p-6 rounded-lg border border-mira-gold/20">
                      <p className="text-gray-400 mb-2">Total Advance Received</p>
                      <p className="text-3xl font-heading text-green-400">
                        ₹{bookings.filter(b => b.booking_status === 'Approved' && b.payment_status === 'Completed').reduce((acc, b) => acc + b.advance_paid, 0).toLocaleString()}
                      </p>
                   </div>
                   <div className="bg-mira-dark p-6 rounded-lg border border-mira-gold/20">
                      <p className="text-gray-400 mb-2">Pending Bookings Count</p>
                      <p className="text-3xl font-heading text-yellow-500">
                        {bookings.filter(b => b.booking_status === 'Pending').length}
                      </p>
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
