import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, Activity, Stethoscope, Eye, Brain, Baby, ShieldCheck, Thermometer } from 'lucide-react';

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  isHighlighted?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  iconName = 'HeartPulse',
  isHighlighted = false,
}) => {
  const getIcon = () => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-8 h-8" />;
      case 'Stethoscope': return <Stethoscope className="w-8 h-8" />;
      case 'Eye': return <Eye className="w-8 h-8" />;
      case 'Brain': return <Brain className="w-8 h-8" />;
      case 'Baby': return <Baby className="w-8 h-8" />;
      case 'Thermometer': return <Thermometer className="w-8 h-8" />;
      case 'ShieldCheck': return <ShieldCheck className="w-8 h-8" />;
      default: return <HeartPulse className="w-8 h-8" />;
    }
  };

  return (
    <div
      className={`rounded-xl p-8 transition-all duration-300 flex flex-col justify-between border ${
        isHighlighted
          ? 'bg-[#1F2B6C] text-white shadow-xl scale-[1.02] border-[#1F2B6C]'
          : 'bg-white text-[#1F2B6C] shadow-md hover:shadow-lg border-gray-100 hover:border-[#BFD2F8]'
      }`}
    >
      <div>
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
            isHighlighted
              ? 'bg-white/10 text-[#BFD2F8]'
              : 'bg-[#F4F9FF] text-[#159EEC]'
          }`}
        >
          {getIcon()}
        </div>

        <h3
          className={`text-xl font-bold mb-3 ${
            isHighlighted ? 'text-white' : 'text-[#1F2B6C]'
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-sm leading-relaxed mb-6 ${
            isHighlighted ? 'text-gray-200' : 'text-[#737373]'
          }`}
        >
          {description}
        </p>
      </div>

      <div>
        <Link
          to={`/services/${id}`}
          className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${
            isHighlighted
              ? 'text-[#BFD2F8] hover:text-white'
              : 'text-[#159EEC] hover:text-[#1F2B6C]'
          }`}
        >
          Learn More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
