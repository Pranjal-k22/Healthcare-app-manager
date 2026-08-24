import React from 'react';
import { DoctorCard } from '../../components/public/DoctorCard';
import { CheckCircle2 } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const leadershipDoctors = [
    {
      id: '1',
      name: 'Dr. Doctor Name',
      department: 'NEUROLOGY & CHIEF OF SURGERY',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      name: 'Dr. Sarah Jenkins',
      department: 'CARDIOLOGY HEAD',
      imageUrl: 'https://images.unsplash.com/photo-1594824813566-78a9c379a557?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      name: 'Dr. Michael Chang',
      department: 'PEDIATRIC CHIEF',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Page Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / About Us</span>
          <h1 className="text-4xl sm:text-5xl font-black">About Meddical Hospital</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            Delivering gold-standard patient care, cutting-edge surgical procedures, and dedicated clinical research since 2004.
          </p>
        </div>
      </section>

      {/* Main Mission & Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#BFD2F8]">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                alt="Hospital Operating Room"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Experience Card */}
            <div className="absolute -bottom-6 -right-6 bg-[#159EEC] text-white p-6 rounded-2xl shadow-2xl hidden sm:block">
              <div className="text-3xl font-black">20+ Years</div>
              <div className="text-xs uppercase font-bold tracking-wider">Clinical Excellence</div>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Welcome to Meddical</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1F2B6C]">
              Best Care for Your Good Health
            </h2>
            <p className="text-sm text-[#737373] leading-relaxed">
              Meddical Hospital is built on a foundation of compassionate care, clinical integrity, and continuous technological innovation. We offer a full spectrum of diagnostic and therapeutic options.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-[#1F2B6C]">A Passion for Healing</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-[#1F2B6C]">5-Star Hospital Rating</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-[#1F2B6C]">All-in-One Diagnostic Hub</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#159EEC] shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-[#1F2B6C]">24/7 Specialist Availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Clinical Directors</span>
          <h2 className="text-3xl font-black text-[#1F2B6C]">Our Medical Leadership</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leadershipDoctors.map((doc) => (
            <DoctorCard key={doc.id} {...doc} />
          ))}
        </div>
      </section>
    </div>
  );
};
