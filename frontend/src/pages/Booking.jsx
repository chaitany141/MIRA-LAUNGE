import { useState, useEffect } from 'react';

const Booking = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    guestCount: 500,
    catering: '',
    decoration: '',
    addons: []
  });

  // Check authentication status on mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
        const res = await fetch(`${API_BASE_URL}/api/packages`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch packages');
        setPackages(data);
      } catch (err) {
        console.error('Error fetching packages:', err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.date) {
        setError('Please select an event date.');
        return;
      }
      if (formData.guestCount < 100 || formData.guestCount > 1000) {
        setError('Guest count must be between 100 and 1000.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.catering) {
        setError('Please select a catering package.');
        return;
      }
      if (!formData.decoration) {
        setError('Please select a decoration package.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authData.name, email: authData.email, phone: authData.phone })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Please ensure your backend server was restarted!");
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setShowOtp(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, otp })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Please ensure your backend server was restarted!");
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic calculations
  const selectedCatering = packages.find(p => p._id === formData.catering);
  const selectedDecoration = packages.find(p => p._id === formData.decoration);
  const selectedAddons = packages.filter(p => formData.addons.includes(p._id));

  const cateringCost = selectedCatering ? selectedCatering.price * formData.guestCount : 0;
  const decorationCost = selectedDecoration ? selectedDecoration.price : 0;
  const addonsCost = selectedAddons.reduce((acc, p) => acc + p.price, 0);

  const totalCost = cateringCost + decorationCost + addonsCost;
  const advance = Math.round(totalCost * 0.25);

  const handleBookingSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        throw new Error('You must be logged in to book.');
      }

      const API_BASE_URL = import.meta.env.MODE === 'production' ? 'https://mira-launge-1.onrender.com' : '';
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          date: formData.date,
          guest_count: formData.guestCount,
          catering_package: formData.catering,
          decoration_package: formData.decoration,
          addons: formData.addons,
          total_cost: totalCost
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to connect to the backend server. Please check if the backend server is running on port 5000.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit booking');

      // Go to Success screen
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-24 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-mira-gold mb-4">Login to Book</h1>
          <p className="text-gray-300">Please provide your details to continue</p>
        </div>

        <div className="glass-card p-8">
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          {!showOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
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
              <button type="submit" disabled={isLoading} className="btn-gold w-full mt-4 flex justify-center">
                {isLoading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <p className="text-gray-300 mb-4">OTP has been sent to {authData.email}</p>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Enter OTP</label>
                <input required type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" placeholder="6-digit code" maxLength={6} />
              </div>
              <button type="submit" disabled={isLoading} className="btn-gold w-full mt-4 flex justify-center">
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
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
        <h1 className="text-4xl font-heading text-mira-gold mb-4">Book Your Event</h1>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 w-16 rounded ${s <= step || step === 4 ? 'bg-mira-gold' : 'bg-gray-700'}`}></div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 sm:p-12">
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}

        {loadingPackages ? (
          <div className="text-center py-12 text-gray-400">Loading booking packages...</div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading text-white mb-6">Event Details</h2>
                <div>
                  <label className="block text-gray-300 mb-2">Event Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" 
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Estimated Guests (100 - 1000)</label>
                  <input 
                    type="number" 
                    min="100" 
                    max="1000" 
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" 
                  />
                </div>
                <button onClick={nextStep} className="btn-gold w-full mt-8">Continue to Packages</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading text-white mb-6">Select Packages</h2>
                <div>
                  <label className="block text-gray-300 mb-2">Catering Package</label>
                  <select 
                    value={formData.catering}
                    onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
                    className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold"
                  >
                    <option value="">Select Catering</option>
                    {packages.filter(p => p.type === 'Catering').map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price}/plate)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Decoration Package</label>
                  <select 
                    value={formData.decoration}
                    onChange={(e) => setFormData({ ...formData, decoration: e.target.value })}
                    className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold"
                  >
                    <option value="">Select Decoration</option>
                    {packages.filter(p => p.type === 'Decoration').map(p => (
                      <option key={p._id} value={p._id}>{p.name} (₹{p.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4">
                  <label className="block text-gray-300 mb-4">Optional Add-ons</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packages.filter(p => p.type === 'Addon').map(p => {
                      const isSelected = formData.addons.includes(p._id);
                      return (
                        <div 
                          key={p._id}
                          onClick={() => {
                            const newAddons = isSelected
                              ? formData.addons.filter(id => id !== p._id)
                              : [...formData.addons, p._id];
                            setFormData({ ...formData, addons: newAddons });
                          }}
                          className={`cursor-pointer p-4 rounded-md border text-left transition-all ${
                            isSelected 
                              ? 'border-mira-gold bg-mira-gold/10' 
                              : 'border-mira-gold/20 bg-mira-black hover:border-mira-gold/50'
                          }`}
                        >
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-xs text-gray-400 my-1 line-clamp-2">{p.description}</div>
                          <div className="text-mira-gold font-medium mt-2">₹{p.price.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="btn-outline-gold">Back</button>
                  <button onClick={nextStep} className="btn-gold">Continue to Summary</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-heading text-white mb-6">Booking Summary</h2>
                <div className="bg-mira-black p-6 rounded-md border border-mira-gold/20 space-y-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Date</span>
                    <span className="text-white">{formData.date ? new Date(formData.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Guests</span>
                    <span className="text-white">{formData.guestCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Catering</span>
                    <span className="text-white">{selectedCatering ? `${selectedCatering.name} (₹${selectedCatering.price}/plate)` : 'None'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Decoration</span>
                    <span className="text-white">{selectedDecoration ? `${selectedDecoration.name} (₹${selectedDecoration.price.toLocaleString()})` : 'None'}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Add-ons</span>
                      <span className="text-white">{selectedAddons.map(a => a.name).join(', ')}</span>
                    </div>
                  )}
                  <hr className="border-mira-gold/20" />
                  <div className="flex justify-between text-gray-300">
                    <span>Total Estimated Cost</span>
                    <span className="text-xl text-mira-gold font-semibold">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 font-semibold">
                    <span>Advance Required (25%)</span>
                    <span className="text-xl text-white">₹{advance.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="btn-outline-gold">Back</button>
                  <button 
                    onClick={handleBookingSubmit} 
                    disabled={isLoading}
                    className="btn-gold px-8 flex justify-center items-center"
                  >
                    {isLoading ? 'Requesting...' : 'Request Booking'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 border border-green-500/50 mb-6">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-heading text-white mb-2">Request Submitted!</h2>
                <p className="text-mira-gold font-medium mb-4">Your booking request status: Pending Review</p>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-8">
                  We are currently reviewing the availability of the venue for your date. Once approved, you will receive an email containing a link to complete the advance payment of ₹{advance.toLocaleString()} to lock in your date.
                </p>
                <button 
                  onClick={() => {
                    setFormData({ date: '', guestCount: 500, catering: '', decoration: '', addons: [] });
                    setStep(1);
                  }}
                  className="btn-gold px-8 py-3"
                >
                  Book Another Event
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;
