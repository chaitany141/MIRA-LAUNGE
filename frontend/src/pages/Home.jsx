import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    // Hero Animation
    gsap.fromTo(
      textRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.5 }
    );

    // Scroll Animation for About
    gsap.fromTo(
      aboutRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070" 
            alt="Luxury Wedding Hall" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 z-10"></div>
        </div>
        
        <div ref={textRef} className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-mira-gold tracking-[0.2em] uppercase text-sm mb-4">Welcome to</h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-6 drop-shadow-lg">
            Mira Lounge
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light drop-shadow-md">
            Celebrate Your Forever in Unmatched Luxury
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/booking" className="btn-gold w-full sm:w-auto text-center">
              Book Your Date
            </Link>
            <Link to="/services" className="btn-outline-gold w-full sm:w-auto text-center">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 bg-mira-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading text-mira-gold mb-6">A Venue Like No Other</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Located in the heart of Sarojini Nagar, Delhi, Mira Lounge is a premium destination designed to turn your dream wedding into reality. With our state-of-the-art facilities, opulent interiors, and world-class hospitality, we ensure every moment is magical.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                From intimate gatherings to grand celebrations, our versatile spaces and dedicated team provide an unforgettable experience tailored just for you.
              </p>
              <Link to="/about" className="text-mira-gold font-semibold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-2">
                Discover More <span className="text-xl">→</span>
              </Link>
            </div>
            <div className="relative h-[600px] rounded-xl overflow-hidden glass-card">
              <div className="absolute inset-0 bg-gradient-to-tr from-mira-gold/20 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069" 
                alt="Mira Lounge Interior" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
