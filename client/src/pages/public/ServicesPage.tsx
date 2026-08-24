import React from 'react';
import { ServiceCard } from '../../components/public/ServiceCard';

export const ServicesPage: React.FC = () => {
  const allServices = [
    {
      id: 'free-checkup',
      title: 'Free Checkup & Screening',
      description: 'Annual wellness checkups, blood glucose testing, lipid panels, and blood pressure monitoring.',
      iconName: 'ShieldCheck',
      isHighlighted: false,
    },
    {
      id: 'cardiology',
      title: 'Cardiology & Heart Care',
      description: 'Electrophysiology, coronary artery disease management, 2D echocardiograms, and Holter monitoring.',
      iconName: 'HeartPulse',
      isHighlighted: true,
    },
    {
      id: 'dna-testing',
      title: 'DNA & Precision Genomics',
      description: 'Genetic risk screening, hereditary disease mapping, and personalized pharmacogenomics.',
      iconName: 'Activity',
      isHighlighted: false,
    },
    {
      id: 'blood-bank',
      title: 'Emergency Blood Bank',
      description: '24/7 blood component therapy, apheresis, and immediate trauma transfusion support.',
      iconName: 'Thermometer',
      isHighlighted: false,
    },
    {
      id: 'neurology',
      title: 'Neurology & Brain Sciences',
      description: 'Comprehensive EEG, stroke management, seizure disorders, and neuro-rehabilitation.',
      iconName: 'Brain',
      isHighlighted: false,
    },
    {
      id: 'pediatrics',
      title: 'Pediatrics & Child Care',
      description: 'Infant growth tracking, vaccinations, pediatric emergency care, and child wellness.',
      iconName: 'Baby',
      isHighlighted: false,
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / Services</span>
          <h1 className="text-4xl sm:text-5xl font-black">Our Medical Services</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            From preventive checkups to complex multi-specialty surgical procedures, our hospital delivers exceptional care.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>
    </div>
  );
};
