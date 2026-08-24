import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Clock, MapPin, Menu, X, Calendar } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-white shadow-sm z-50 sticky top-0">
      {/* Top Header Bar */}
      <div className="bg-[#1F2B6C] text-white py-2.5 px-4 sm:px-8 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#159EEC]" />
              <span className="font-semibold">EMERGENCY:</span>
              <span>(237) 681-812-255</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#159EEC]" />
              <span className="font-semibold">WORK HOURS:</span>
              <span>08:00 - 20:00 Everyday</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#159EEC]" />
              <span className="font-semibold">LOCATION:</span>
              <span>0123 Real Street, City</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[#BFD2F8] transition-colors text-xs font-medium">
              Staff / Patient Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1F2B6C] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            M
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#1F2B6C]">MEDDICAL</span>
            <span className="block text-[10px] tracking-widest text-[#159EEC] uppercase font-bold">
              Hospital & Care Center
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition-colors py-1 ${
                isActive(link.path)
                  ? 'text-[#159EEC] border-b-2 border-[#159EEC]'
                  : 'text-[#1F2B6C] hover:text-[#159EEC]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/appointment"
            className="flex items-center gap-2 bg-[#BFD2F8] text-[#1F2B6C] hover:bg-[#159EEC] hover:text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-[#1F2B6C] p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2 text-base font-semibold ${
                isActive(link.path) ? 'text-[#159EEC]' : 'text-[#1F2B6C]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/appointment"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center w-full bg-[#159EEC] text-white py-3 rounded-full font-bold text-sm shadow"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
