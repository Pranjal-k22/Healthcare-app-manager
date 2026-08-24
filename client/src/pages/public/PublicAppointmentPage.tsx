import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppointmentForm } from '../../components/public/AppointmentForm';
import { Phone } from 'lucide-react';

export const PublicAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor') || undefined;

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / Appointment</span>
          <h1 className="text-4xl sm:text-5xl font-black">Book an Appointment</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            Reserve your consultation with our board-certified clinical specialists online.
          </p>
        </div>
      </section>

      {/* Main Appointment Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <AppointmentForm preselectedDoctor={preselectedDoctor} />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#159EEC] text-white p-8 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-2xl font-bold">Schedule by Phone</h3>
            <p className="text-xs text-gray-100 leading-relaxed">
              Prefer speaking with our hospital reception directly? Call our dedicated scheduling hotline.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Phone className="w-6 h-6 text-white" />
              <div>
                <p className="text-xs text-gray-200 font-bold uppercase">Direct Line:</p>
                <p className="text-lg font-black">(237) 681-812-255</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 text-[#1F2B6C]">
            <h3 className="text-lg font-bold border-b border-[#159EEC] pb-2">Hospital Operating Hours</h3>
            <div className="space-y-2 text-xs text-[#737373]">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-[#1F2B6C]">Monday - Friday:</span>
                <span>08:00 AM - 08:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="font-semibold text-[#1F2B6C]">Saturday:</span>
                <span>09:00 AM - 06:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#1F2B6C]">Sunday:</span>
                <span>09:00 AM - 03:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
