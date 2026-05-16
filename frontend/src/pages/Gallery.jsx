import { useState } from 'react';

const Gallery = () => {
  const images = [
    { id: 1, category: 'Hall', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800' },
    { id: 2, category: 'Decorations', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800' },
    { id: 3, category: 'Dining', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800' },
    { id: 4, category: 'Hall', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800' },
    { id: 5, category: 'Decorations', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800' },
    { id: 6, category: 'Dining', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800' },
    { id: 7, category: 'Hall', url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=800' },
    { id: 8, category: 'Decorations', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?q=80&w=800' },
    { id: 9, category: 'Dining', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800' },
  ];

  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading text-mira-gold mb-4">Our Gallery</h1>
        <div className="flex justify-center space-x-4 mt-8">
          {['All', 'Hall', 'Decorations', 'Dining'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-md transition-colors ${filter === cat ? 'bg-mira-gold text-mira-black' : 'text-mira-gold border border-mira-gold/50 hover:bg-mira-gold/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredImages.map(img => (
          <div key={img.id} className="relative group overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedImage(img.url)}>
            <div className="w-full bg-[#1a1a1a] border border-mira-gold/20 aspect-[4/3] group-hover:scale-105 transition-transform duration-500">
               <img src={img.url} alt={img.category} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-mira-gold border border-mira-gold px-4 py-2 rounded">View</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full aspect-video bg-[#1a1a1a] flex items-center justify-center border border-mira-gold/30 rounded-lg overflow-hidden">
             <button className="absolute z-10 top-4 right-4 text-mira-gold text-4xl hover:text-white bg-black/50 w-12 h-12 rounded-full" onClick={() => setSelectedImage(null)}>&times;</button>
             <img src={selectedImage} alt="Expanded" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
