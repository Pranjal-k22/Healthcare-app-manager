import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Share2 } from 'lucide-react';

export const SingleNews: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>();

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / News / Article</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            A Better Choice For Your Health and Medical Care Needs
          </h1>
          <div className="flex justify-center items-center gap-6 text-xs text-[#BFD2F8] pt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#159EEC]" /> Monday 05, July 2026</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-[#159EEC]" /> By Admin</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#159EEC]" /> 68 Views</span>
          </div>
        </div>
      </section>

      {/* Main Article Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="w-full h-96 rounded-2xl overflow-hidden shadow-xl bg-[#BFD2F8]">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
            alt="Article Banner"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-[#1F2B6C]">
          <p className="text-base leading-relaxed text-[#737373]">
            Preventive healthcare forms the cornerstone of modern wellness management. Regular clinical screenings enable early detection of subclinical conditions, allowing timely therapeutic intervention long before severe complications manifest.
          </p>

          <h2 className="text-2xl font-bold text-[#1F2B6C]">Why Annual Health Screenings Matter</h2>

          <p className="text-sm leading-relaxed text-[#737373]">
            Routine blood pressure monitoring, comprehensive lipid profiling, and blood glucose tests provide vital baseline metrics for your physician. When combined with personalized lifestyle recommendations, these early indicators drastically reduce stroke and myocardial infarction risks.
          </p>

          <blockquote className="bg-[#F4F9FF] border-l-4 border-[#159EEC] p-6 rounded-r-xl text-base font-semibold italic text-[#1F2B6C]">
            "Investing early in preventive health leads to decades of vibrant longevity." — Dr. Doctor Name, Chief of Surgery
          </blockquote>

          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <Link to="/news" className="inline-flex items-center gap-2 text-sm font-bold text-[#159EEC] hover:text-[#1F2B6C]">
              <ArrowLeft className="w-4 h-4" /> Back to News
            </Link>
            <button className="inline-flex items-center gap-2 text-xs font-bold text-[#1F2B6C] bg-[#F4F9FF] px-4 py-2 rounded-full hover:bg-[#BFD2F8]">
              <Share2 className="w-4 h-4 text-[#159EEC]" /> Share Article
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
