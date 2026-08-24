import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Facebook, Instagram, Calendar } from 'lucide-react';

export interface DoctorCardProps {
  id?: string;
  name: string;
  department: string;
  imageUrl?: string;
  email?: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  id: _id = '1',
  name,
  department,
  imageUrl,
}) => {
  // Fallback image gradient/placeholder if imageUrl is not provided
  const fallbackAvatar = `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80`;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col justify-between">
      <div>
        {/* Doctor Image Container */}
        <div className="relative h-72 bg-[#BFD2F8] overflow-hidden">
          <img
            src={imageUrl || fallbackAvatar}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B6C]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 justify-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white/90 text-[#1F2B6C] flex items-center justify-center cursor-pointer hover:bg-[#159EEC] hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-full bg-white/90 text-[#1F2B6C] flex items-center justify-center cursor-pointer hover:bg-[#159EEC] hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </span>
            <span className="w-8 h-8 rounded-full bg-white/90 text-[#1F2B6C] flex items-center justify-center cursor-pointer hover:bg-[#159EEC] hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-[#1F2B6C] mb-1 group-hover:text-[#159EEC] transition-colors">
            {name}
          </h3>
          <p className="text-xs font-bold text-[#159EEC] tracking-widest uppercase mb-4">
            {department}
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-[#F4F9FF] text-[#1F2B6C] flex items-center justify-center text-xs">
              <Linkedin className="w-3.5 h-3.5" />
            </span>
            <span className="w-7 h-7 rounded-full bg-[#F4F9FF] text-[#1F2B6C] flex items-center justify-center text-xs">
              <Facebook className="w-3.5 h-3.5" />
            </span>
            <span className="w-7 h-7 rounded-full bg-[#F4F9FF] text-[#1F2B6C] flex items-center justify-center text-xs">
              <Instagram className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#1F2B6C] text-white p-3 text-center transition-colors hover:bg-[#159EEC]">
        <Link
          to={`/appointment?doctor=${encodeURIComponent(name)}`}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </Link>
      </div>
    </div>
  );
};
