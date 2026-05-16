import { useState } from 'react';

const Booking = () => {
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

  // Mock calculation
  const totalCost = 1500000; 
  const advance = totalCost * 0.25;

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
