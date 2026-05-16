import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed w-full z-50 bg-mira-dark/80 backdrop-blur-md border-b border-mira-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-heading text-mira-gold tracking-widest uppercase">
              Mira Lounge
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="hover:text-mira-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/about" className="hover:text-mira-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
              <Link to="/gallery" className="hover:text-mira-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Gallery</Link>
              <Link to="/services" className="hover:text-mira-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</Link>
              <Link to="/booking" className="btn-gold ml-4">Book Now</Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={toggleMenu} className="text-mira-gold hover:text-white inline-flex items-center justify-center p-2 rounded-md focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-mira-black border-b border-mira-gold/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={toggleMenu} className="hover:text-mira-gold block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link to="/about" onClick={toggleMenu} className="hover:text-mira-gold block px-3 py-2 rounded-md text-base font-medium">About</Link>
            <Link to="/gallery" onClick={toggleMenu} className="hover:text-mira-gold block px-3 py-2 rounded-md text-base font-medium">Gallery</Link>
            <Link to="/services" onClick={toggleMenu} className="hover:text-mira-gold block px-3 py-2 rounded-md text-base font-medium">Services</Link>
            <Link to="/booking" onClick={toggleMenu} className="btn-gold block text-center mt-4 mx-3">Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
