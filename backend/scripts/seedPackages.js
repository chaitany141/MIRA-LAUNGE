const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Package = require('../models/Package');

dotenv.config();

const packages = [
  // Catering Packages
  {
    type: 'Catering',
    name: 'Classic Elegance',
    description: 'Premium dining experience with classic gourmet selections (veg/non-veg buffet, soft drinks, desserts).',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=60'
  },
  {
    type: 'Catering',
    name: 'Royal Feast',
    description: 'Luxurious royal multi-cuisine dining experience (premium starters, live counters, mocktails, exotic desserts).',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60'
  },
  // Decoration Packages
  {
    type: 'Decoration',
    name: 'Minimalist Chic',
    description: 'Modern, clean, and elegant design theme (pastel floral arrangements, subtle LED lighting, elegant drapery).',
    price: 200000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60'
  },
  {
    type: 'Decoration',
    name: 'Golden Glow',
    description: 'Stunning gold-themed floral and luxury lighting decoration (grand entrance arch, premium stage setup, fairy lights).',
    price: 500000,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=60'
  },
  // Addons
  {
    type: 'Addon',
    name: 'Live Music & DJ',
    description: 'Professional DJ, premium sound system, intelligent lighting, and dance floor setup.',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60'
  },
  {
    type: 'Addon',
    name: 'Photography & Videography',
    description: 'Cinematic wedding shoot, pre-wedding album, candid photography, and 4K video recording.',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60'
  }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected for seeding packages...');
  
  // Clear existing packages
  await Package.deleteMany({});
  console.log('Cleared existing packages');

  // Insert new packages
  await Package.insertMany(packages);
  console.log('Successfully seeded packages!');

  process.exit();
}).catch(err => {
  console.error('Error seeding packages:', err);
  process.exit(1);
});
