import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-mira-black text-white">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/pay/:id" element={<Payment />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
