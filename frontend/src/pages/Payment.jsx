import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setIsAuthenticated(true);
      fetchBookingDetails(JSON.parse(userInfo).token);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [id]);

  const fetchBookingDetails = async (token) => {
    setLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve booking details.');
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authData.name, email: authData.email, phone: authData.phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setShowOtp(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsAuthenticated(true);
      fetchBookingDetails(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (method) => {
    setCheckoutLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) throw new Error('You must be logged in to pay.');

      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ payment_method: method })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize payment.');

      if (method === 'Online') {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SqQZPGurw9sJUt',
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Mira Lounge',
          description: 'Advance Booking Payment',
          order_id: data.order.id,
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/api/bookings/${id}/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed');
              
              setPaymentSuccess(true);
              fetchBookingDetails(userInfo.token);
            } catch (err) {
              alert('Payment verification failed: ' + err.message);
            }
          },
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: userInfo.phone
          },
          theme: {
            color: '#c5a880'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Cash payment success UI transition
        setPaymentSuccess(true);
        fetchBookingDetails(userInfo.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-24 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-mira-gold mb-4">Verification Required</h1>
          <p className="text-gray-300">Please verify your details to complete your payment.</p>
        </div>

        <div className="glass-card p-8">
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          {!showOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Full Name</label>
                <input required type="text" name="name" value={authData.name} onChange={handleAuthChange} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                <input required type="email" name="email" value={authData.email} onChange={handleAuthChange} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Phone Number</label>
                <input required type="tel" name="phone" value={authData.phone} onChange={handleAuthChange} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" placeholder="Enter your phone number" />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full mt-4 flex justify-center">
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-gray-300 mb-4 font-light">OTP has been sent to {authData.email}</p>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Enter OTP</label>
                <input required type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" placeholder="6-digit code" maxLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full mt-4 flex justify-center">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setShowOtp(false)} className="text-sm text-mira-gold hover:text-white mt-4 block mx-auto">
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading text-mira-gold mb-2">Secure Checkout</h1>
        <p className="text-gray-400 font-light">Finalize your slot reservation at Mira Lounge</p>
      </div>

      <div className="glass-card p-8 sm:p-12">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Retrieving invoice details...</div>
        ) : error ? (
          <div className="text-center py-6">
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded mb-6">{error}</div>
            <button onClick={() => navigate('/booking')} className="btn-outline-gold px-6 py-2">Back to Booking</button>
          </div>
        ) : booking ? (
          <>
            {/* Booking Status is not approved */}
            {booking.booking_status === 'Pending' && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/30 border border-yellow-500/50 mb-6">
                  <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading text-white mb-2">Awaiting Approval</h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                  Your event request for {new Date(booking.date).toLocaleDateString()} is currently pending review by administrators. Payments can only be processed after approval.
                </p>
                <button onClick={() => navigate('/')} className="btn-gold px-8 py-3">Return to Home</button>
              </div>
            )}

            {booking.booking_status === 'Rejected' && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 border border-red-500/50 mb-6">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading text-white mb-2">Request Declined</h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                  This booking request was declined. Please verify availability for another date or contact our team if you need assistance.
                </p>
                <button onClick={() => navigate('/booking')} className="btn-gold px-8 py-3">Book Another Date</button>
              </div>
            )}

            {/* Approved and already paid */}
            {booking.booking_status === 'Approved' && booking.payment_status === 'Completed' && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 border border-green-500/50 mb-6">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading text-white mb-2">Payment Confirmed!</h3>
                <p className="text-mira-gold font-medium mb-4">Your booking is fully secured.</p>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                  The advance payment for your event on {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} has been successfully processed. An event coordinator will reach out to you shortly.
                </p>
                <button onClick={() => navigate('/')} className="btn-gold px-8 py-3">Go to Home</button>
              </div>
            )}

            {/* Approved and cash pending */}
            {booking.booking_status === 'Approved' && booking.payment_status === 'Pending' && booking.payment_method === 'Cash' && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-900/30 border border-indigo-500/50 mb-6">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-heading text-white mb-2">Cash Reservation Confirmed</h3>
                <p className="text-mira-gold font-medium mb-4">Awaiting cash advance payment at venue</p>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                  Your event slot is reserved! Please visit Mira Lounge within 48 hours to complete the cash advance payment of ₹{booking.advance_paid.toLocaleString()} to lock in your booking.
                </p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => handleCheckout('Online')} disabled={checkoutLoading} className="btn-gold px-6 py-2 text-sm">Pay Online Instead</button>
                  <button onClick={() => navigate('/')} className="btn-outline-gold px-6 py-2 text-sm">Return to Home</button>
                </div>
              </div>
            )}

            {/* Approved and needs payment */}
            {booking.booking_status === 'Approved' && booking.payment_status === 'Pending' && booking.payment_method === 'Pending' && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-mira-gold/20 pb-4">
                  <h2 className="text-2xl font-heading text-white mb-1">Approved Event Invoice</h2>
                  <p className="text-sm text-gray-400">Booking ID: #{booking._id.substring(booking._id.length - 8)}</p>
                </div>

                <div className="bg-mira-black p-6 rounded-md border border-mira-gold/20 space-y-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Event Date</span>
                    <span className="text-white font-medium">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Guest Count</span>
                    <span className="text-white font-medium">{booking.guest_count} guests</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Catering Package</span>
                    <span className="text-white font-medium">{booking.catering_package?.name} (₹{booking.catering_package?.price}/plate)</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Decoration Package</span>
                    <span className="text-white font-medium">{booking.decoration_package?.name} (₹{booking.decoration_package?.price.toLocaleString()})</span>
                  </div>
                  {booking.addons && booking.addons.length > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Add-ons</span>
                      <span className="text-white font-medium">{booking.addons.map(a => a.name).join(', ')}</span>
                    </div>
                  )}
                  <hr className="border-mira-gold/20" />
                  <div className="flex justify-between text-gray-300">
                    <span>Total Cost</span>
                    <span className="text-lg text-white font-semibold">₹{booking.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-mira-gold font-bold text-lg bg-mira-gold/5 p-3 rounded border border-mira-gold/20">
                    <span>Advance Required (25%)</span>
                    <span>₹{booking.advance_paid.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 text-center">
                  <h3 className="text-lg font-heading text-white">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <button 
                      onClick={() => handleCheckout('Online')}
                      disabled={checkoutLoading}
                      className="btn-gold py-3 px-6 flex justify-center items-center font-semibold"
                    >
                      {checkoutLoading ? 'Processing...' : 'Pay Online (Razorpay)'}
                    </button>
                    <button 
                      onClick={() => handleCheckout('Cash')}
                      disabled={checkoutLoading}
                      className="py-3 px-6 text-mira-gold border border-mira-gold/30 rounded-md hover:bg-mira-gold/10 transition-colors font-medium"
                    >
                      {checkoutLoading ? 'Processing...' : 'Pay Cash at Venue'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-gray-400">No booking details available.</div>
        )}
      </div>
    </div>
  );
};

export default Payment;
