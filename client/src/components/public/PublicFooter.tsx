import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#1F2B6C] text-white pt-16 pb-8 border-t border-[#2A3982]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2A3A8A]">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#159EEC] flex items-center justify-center text-white font-extrabold text-xl shadow">
              M
            </div>
            <span className="text-2xl font-black tracking-tight text-white">MEDDICAL</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Leading the way in medical excellence with compassionate patient care, state-of-the-art diagnostic technology, and expert specialists.
          </p>
          <div className="flex items-center gap-4 pt-2">
            {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
              <span
                key={social}
                className="w-9 h-9 rounded-full bg-[#2A3982] hover:bg-[#159EEC] flex items-center justify-center transition-colors cursor-pointer text-xs uppercase font-bold"
              >
                {social[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white tracking-wide border-b border-[#159EEC] pb-2 inline-block">
            Important Links
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-300">
            {['Appointment', 'Doctors', 'Services', 'About Us', 'News', 'Contact'].map((link) => {
              const path = link === 'Appointment' ? '/appointment' : link === 'About Us' ? '/about' : `/${link.toLowerCase()}`;
              return (
                <li key={link}>
                  <Link to={path} className="hover:text-[#159EEC] transition-colors flex items-center gap-2">
                    <span className="text-[#159EEC] font-bold">&rsaquo;</span> {link}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Col 3: Contact Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white tracking-wide border-b border-[#159EEC] pb-2 inline-block">
            Contact Us
          </h4>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Call Emergency:</p>
                <p>(237) 681-812-255</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Email Us:</p>
                <p>fdedhospital@gmail.com</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Location:</p>
                <p>0123 Real Street, City, Country</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white tracking-wide border-b border-[#159EEC] pb-2 inline-block">
            Newsletter
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            Subscribe to our medical newsletter to receive health tips, hospital updates, and wellness offers.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center bg-[#2A3982] rounded-lg overflow-hidden p-1 border border-[#3B4C9F]">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent text-sm text-white px-3 py-2 outline-none w-full placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#159EEC] hover:bg-blue-600 text-white p-2.5 rounded-md transition-colors"
              aria-label="Subscribe"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
        <p>&copy; {new Date().getFullYear()} Meddical Hospital. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Designed for Excellence <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
        </p>
      </div>
    </footer>
  );
};
