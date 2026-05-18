import { useState } from 'react';

const Booking = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [authData, setAuthData] = useState({ name: '', email: '', phone: '', otp: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    guestCount: 500,
    catering: '',
    decoration: '',
    addons: []
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
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
      
      console.log('Mock OTP sent:', data.mockOtp);
      setAuthStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: authData.phone, otp: authData.otp })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Please ensure your backend server was restarted!");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock calculation
  const totalCost = 1500000; 
  const advance = totalCost * 0.25;

  if (!isAuthenticated) {
    return (
      <div className="py-24 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-mira-gold mb-4">Login to Book</h1>
          <p className="text-gray-300">Please verify your details to continue</p>
        </div>

        <div className="glass-card p-8">
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          {authStep === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4 animate-fade-in">
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
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4 animate-fade-in">
               <p className="text-sm text-gray-400 mb-4 text-center">We've sent a 6-digit OTP to {authData.phone}</p>
               <div>
                <label className="block text-gray-300 mb-2 text-sm">Enter OTP</label>
                <input required type="text" maxLength="6" name="otp" value={authData.otp} onChange={handleAuthChange} className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold text-center tracking-[0.5em] text-lg" placeholder="------" />
              </div>
              <button type="submit" disabled={isLoading} className="btn-gold w-full mt-4 flex justify-center">
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setAuthStep(1)} className="w-full text-sm text-mira-gold mt-4 hover:text-white transition-colors">
                Change phone number
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
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-2 w-16 rounded ${s <= step ? 'bg-mira-gold' : 'bg-gray-700'}`}></div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 sm:p-12">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-heading text-white mb-6">Event Details</h2>
            <div>
              <label className="block text-gray-300 mb-2">Event Date</label>
              <input type="date" className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Estimated Guests (Max 1000)</label>
              <input type="number" min="100" max="1000" className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold" defaultValue={500} />
            </div>
            <button onClick={nextStep} className="btn-gold w-full mt-8">Continue to Packages</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-heading text-white mb-6">Select Packages</h2>
            <div>
              <label className="block text-gray-300 mb-2">Catering Package</label>
              <select className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold">
                <option value="">Select Catering</option>
                <option value="royal">Royal Feast (₹2500/plate)</option>
                <option value="classic">Classic Elegance (₹1500/plate)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Decoration Package</label>
              <select className="w-full bg-mira-black border border-mira-gold/30 rounded-md px-4 py-3 text-white focus:outline-none focus:border-mira-gold">
                <option value="">Select Decoration</option>
                <option value="golden">Golden Glow (₹5,00,000)</option>
                <option value="minimalist">Minimalist Chic (₹2,00,000)</option>
              </select>
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
                <span className="text-white">Oct 15, 2026</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Guests</span>
                <span className="text-white">500</span>
              </div>
              <hr className="border-mira-gold/20" />
              <div className="flex justify-between text-gray-300">
                <span>Total Estimated Cost</span>
                <span className="text-xl text-mira-gold">₹{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300 font-semibold">
                <span>Advance Required (25%)</span>
                <span className="text-xl text-white">₹{advance.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={prevStep} className="btn-outline-gold">Back</button>
              <button onClick={nextStep} className="btn-gold">Proceed to Payment</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center">
            <h2 className="text-2xl font-heading text-white mb-2">Complete Payment</h2>
            <p className="text-gray-400 mb-8">Pay the advance amount of ₹{advance.toLocaleString()} to secure your date.</p>
            
            <div className="space-y-4">
               <button className="btn-gold w-full flex justify-center items-center gap-2">
                 Pay Online (Razorpay)
               </button>
               <button className="w-full py-3 text-mira-gold border border-mira-gold/30 rounded-md hover:bg-mira-gold/10 transition-colors">
                 Pay Cash at Venue
               </button>
            </div>
            <div className="mt-8">
               <button onClick={prevStep} className="text-sm text-gray-500 hover:text-white">Back to Summary</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
