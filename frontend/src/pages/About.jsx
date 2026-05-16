const About = () => {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-heading text-mira-gold mb-4">About Mira Lounge</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Discover the perfect blend of traditional elegance and modern luxury.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-heading text-white">Our Heritage</h2>
          <p className="text-gray-300 leading-relaxed">
            Established with a vision to provide a breathtaking setting for life's most precious moments, Mira Lounge stands as a beacon of luxury in Sarojini Nagar, Delhi. Our grand hall is meticulously designed with intricate details, majestic chandeliers, and a layout that accommodates both grandeur and intimacy.
          </p>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center"><span className="w-2 h-2 bg-mira-gold rounded-full mr-3"></span> Capacity: 500 - 1000 Guests</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-mira-gold rounded-full mr-3"></span> Fully Centrally Air Conditioned</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-mira-gold rounded-full mr-3"></span> Valet Parking for 200+ Cars</li>
            <li className="flex items-center"><span className="w-2 h-2 bg-mira-gold rounded-full mr-3"></span> Luxurious Bridal & Groom Suites</li>
          </ul>
        </div>
        <div className="h-[500px] glass-card flex items-center justify-center relative overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069" 
               alt="Grand Hall Interior" 
               className="w-full h-full object-cover"
             />
        </div>
      </div>
    </div>
  );
};

export default About;
