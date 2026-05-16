import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-mira-dark border-t border-mira-gold/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-heading text-mira-gold mb-4">Mira Lounge</h2>
            <p className="text-gray-400 mb-6 max-w-sm">
              Experience the epitome of luxury and elegance at Delhi's premier wedding destination. Celebrate your forever in style.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-mira-gold hover:text-white transition-colors">Facebook</a>
              <a href="#" className="text-mira-gold hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-mira-gold hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-heading text-mira-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-mira-gold transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-mira-gold transition-colors">Our Services</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-mira-gold transition-colors">Gallery</Link></li>
              <li><Link to="/booking" className="text-gray-400 hover:text-mira-gold transition-colors">Book Venue</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-heading text-mira-gold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>123 Luxury Avenue</li>
              <li>Sarojini Nagar, Delhi</li>
              <li>+91 98765 43210</li>
              <li>info@miralounge.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-mira-gold/10 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mira Lounge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
