import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppointmentForm } from '../../components/public/AppointmentForm';
import { CheckCircle2 } from 'lucide-react';

export const SingleService: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / Services / Detail</span>
          <h1 className="text-4xl sm:text-5xl font-black capitalize">
            {id ? id.replace('-', ' ') : 'Cardiology Care'}
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg bg-[#BFD2F8]">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
              alt="Medical Service Detail"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1F2B6C]">Comprehensive Medical Excellence</h2>
            <p className="text-sm text-[#737373] leading-relaxed">
              Our department provides world-class diagnostic testing, non-invasive therapeutic interventions, and dedicated outpatient clinical management. Equipped with modern technology and staffed by senior medical specialists, we ensure precise treatment plans tailored to every patient.
            </p>

            <h3 className="text-lg font-bold text-[#1F2B6C] pt-2">Key Diagnostic & Therapeutic Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-[#1F2B6C]">
                <CheckCircle2 className="w-4 h-4 text-[#159EEC]" /> 24-Hour Continuous Monitoring
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1F2B6C]">
                <CheckCircle2 className="w-4 h-4 text-[#159EEC]" /> Advanced Echo & ECG Labs
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1F2B6C]">
                <CheckCircle2 className="w-4 h-4 text-[#159EEC]" /> Personalized Rehabilitation
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1F2B6C]">
                <CheckCircle2 className="w-4 h-4 text-[#159EEC]" /> Rapid Emergency Response Unit
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Appointment Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-[#1F2B6C] border-b border-[#159EEC] pb-2">All Specialties</h3>
            <ul className="space-y-2 text-sm">
              {['Free Checkup', 'Cardiology Care', 'DNA & Lab Diagnostics', 'Neurology', 'Pediatrics', 'Blood Bank'].map((svc) => (
                <li key={svc}>
                  <Link
                    to={`/services/${svc.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block p-3 rounded-lg bg-[#F4F9FF] text-[#1F2B6C] font-semibold hover:bg-[#159EEC] hover:text-white transition-colors"
                  >
                    {svc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <AppointmentForm />
        </div>
      </section>
    </div>
  );
};
