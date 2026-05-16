const Services = () => {
  const packages = [
    { id: 1, type: 'Catering', name: 'Royal Feast', description: 'Premium 5-course meal with live counters, imported beverages, and exotic desserts.', price: 2500, priceUnit: 'per plate', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800' },
    { id: 2, type: 'Catering', name: 'Classic Elegance', description: 'Traditional 3-course meal with standard beverages and assorted desserts.', price: 1500, priceUnit: 'per plate', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800' },
    { id: 3, type: 'Decoration', name: 'Golden Glow', description: 'Luxurious floral arrangements with imported orchids, crystal centerpieces, and premium lighting.', price: 500000, priceUnit: 'total', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800' },
    { id: 4, type: 'Decoration', name: 'Minimalist Chic', description: 'Elegant and understated decor with local seasonal flowers and warm fairy lights.', price: 200000, priceUnit: 'total', image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800' },
    { id: 5, type: 'Addon', name: 'Live Band', description: 'Professional 5-piece live band for 4 hours.', price: 50000, priceUnit: 'total', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800' },
    { id: 6, type: 'Addon', name: 'Drone Photography', description: 'Cinematic drone coverage of the event.', price: 30000, priceUnit: 'total', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800' },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-heading text-mira-gold mb-4">Our Premium Services</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tailored packages designed to make your special day absolutely flawless.</p>
      </div>

      {['Catering', 'Decoration', 'Addon'].map(category => (
        <div key={category} className="mb-16">
          <h2 className="text-3xl font-heading text-white mb-8 border-b border-mira-gold/20 pb-4">{category} Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.filter(p => p.type === category).map(pkg => (
              <div key={pkg.id} className="glass-card flex flex-col hover:border-mira-gold transition-colors duration-300 overflow-hidden">
                <div className="h-48 w-full overflow-hidden">
                   <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-heading text-mira-gold mb-2">{pkg.name}</h3>
                  <p className="text-gray-300 mb-6 flex-grow">{pkg.description}</p>
                  <div className="mt-auto">
                    <p className="text-3xl font-semibold text-white mb-1">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">{pkg.priceUnit}</p>
                    <button className="btn-outline-gold w-full">Select Package</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Services;
