import React from 'react';
import { Link } from 'react-router-dom';
import { DoctorCard } from '../../components/public/DoctorCard';
import { ServiceCard } from '../../components/public/ServiceCard';
import { NewsCard } from '../../components/public/NewsCard';
import { AppointmentForm } from '../../components/public/AppointmentForm';
import { Phone, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Home: React.FC = () => {
  const services = [
    {
      id: 'free-checkup',
      title: 'Free Checkup',
      description: 'Comprehensive health checkups and preventive screening services at zero out-of-pocket cost.',
      iconName: 'ShieldCheck',
      isHighlighted: false,
    },
    {
      id: 'cardiology',
      title: 'Cardiology Care',
      description: 'Advanced cardiovascular diagnostics, ECG, echocardiograms, and cardiac surgery support.',
      iconName: 'HeartPulse',
      isHighlighted: true,
    },
    {
      id: 'dna-testing',
      title: 'DNA & Lab Diagnostics',
      description: 'Precision genomic testing, molecular diagnostics, and rapid pathology analysis.',
      iconName: 'Activity',
      isHighlighted: false,
    },
    {
      id: 'blood-bank',
      title: 'Blood Bank & Emergency',
      description: '24/7 emergency trauma support, rapid transfusions, and critical care units.',
      iconName: 'Thermometer',
      isHighlighted: false,
    },
  ];

  const doctors = [
    {
      id: '1',
      name: 'Dr. Doctor Name',
      department: 'NEUROLOGY',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      name: 'Dr. Sarah Jenkins',
      department: 'CARDIOLOGY',
      imageUrl: 'https://images.unsplash.com/photo-1594824813566-78a9c379a557?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      name: 'Dr. Michael Chang',
      department: 'PEDIATRICS',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const articles = [
    {
      id: 'article-1',
      title: 'A better choice for your health and medical care needs.',
      category: 'Health Care',
      date: 'Monday 05, July 2026',
      author: 'By Admin',
      views: 68,
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      snippet: 'Discover how modern preventive healthcare models are transforming long-term wellness and reducing emergency admissions.',
    },
    {
      id: 'article-2',
      title: 'Understanding cardiovascular health and routine checkups.',
      category: 'Cardiology',
      date: 'Sunday 12, June 2026',
      author: 'By Dr. Jenkins',
      views: 142,
      imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
      snippet: 'Key risk factors, dietary recommendations, and diagnostic indicators that keep your heart performing at its best.',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#F4F9FF] via-white to-[#BFD2F8]/30 py-20 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <span className="inline-block bg-[#BFD2F8] text-[#1F2B6C] font-bold text-xs px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm">
              Caring for Life
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F2B6C] leading-tight tracking-tight">
              Leading the Way in Medical Excellence
            </h1>
            <p className="text-base sm:text-lg text-[#737373] leading-relaxed max-w-xl">
              We provide world-class clinical care, expert specialist advice, and 24/7 emergency response for you and your family.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/services"
                className="bg-[#159EEC] hover:bg-[#1F2B6C] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2"
              >
                Our Services <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/appointment"
                className="bg-[#BFD2F8] hover:bg-[#159EEC] text-[#1F2B6C] hover:text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Hero Image / Banner Graphic */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md h-[420px] rounded-3xl bg-[#BFD2F8] shadow-2xl overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                alt="Hospital Facility"
                className="w-full h-full object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
                <div className="w-12 h-12 bg-[#159EEC] text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  24/7
                </div>
                <div>
                  <h4 className="font-bold text-[#1F2B6C] text-sm">Emergency Support</h4>
                  <p className="text-xs text-[#737373]">(237) 681-812-255</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Cards (3 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-12 z-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Emergency */}
          <div className="bg-[#1F2B6C] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Emergency Cases</h3>
              <Phone className="w-8 h-8 text-[#159EEC]" />
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Immediate medical assistance, ambulance dispatch, and 24/7 trauma care response.
            </p>
            <p className="text-lg font-bold text-[#BFD2F8]">(237) 681-812-255</p>
          </div>

          {/* Card 2: Timetable */}
          <div className="bg-[#BFD2F8] text-[#1F2B6C] p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Doctors Timetable</h3>
              <Calendar className="w-8 h-8 text-[#1F2B6C]" />
            </div>
            <p className="text-xs text-[#1F2B6C]/80 leading-relaxed">
              Check specialist availability and schedule consultations with our top medical consultants.
            </p>
            <Link to="/doctors" className="inline-flex items-center gap-2 font-bold text-sm text-[#1F2B6C]">
              View Schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Opening Hours */}
          <div className="bg-[#159EEC] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Opening Hours</h3>
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1 text-xs text-gray-100">
              <div className="flex justify-between border-b border-white/20 pb-1">
                <span>Mon - Fri:</span>
                <span className="font-bold">08:00 - 20:00</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-1">
                <span>Saturday:</span>
                <span className="font-bold">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-bold">09:00 - 15:00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us / Welcome Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Welcome to Meddical</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F2B6C]">A Great Place to Receive Care</h2>
          <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
            Combining compassion with clinical innovation, our hospital provides end-to-end medical care across cardiology, neurology, pediatrics, and general diagnostics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl sm:text-4xl font-black text-[#159EEC] mb-1">50+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F2B6C]">Expert Doctors</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl sm:text-4xl font-black text-[#159EEC] mb-1">10,000+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F2B6C]">Happy Patients</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl sm:text-4xl font-black text-[#159EEC] mb-1">100+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F2B6C]">Hospital Beds</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl sm:text-4xl font-black text-[#159EEC] mb-1">20+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F2B6C]">Years Experience</div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Care You Can Trust</span>
            <h2 className="text-3xl font-black text-[#1F2B6C]">Our Special Services</h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-bold text-[#159EEC] hover:text-[#1F2B6C] flex items-center gap-1"
          >
            View All Services &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      {/* Book Appointment Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Book an Appointment</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1F2B6C]">
              Schedule Your Medical Consultation Online
            </h2>
            <p className="text-sm text-[#737373] leading-relaxed">
              Select your department, doctor, and preferred time slot. Our reception team will confirm your reservation immediately.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#159EEC]" />
                <span className="text-sm font-bold text-[#1F2B6C]">Guaranteed Zero Waiting Time</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#159EEC]" />
                <span className="text-sm font-bold text-[#1F2B6C]">24/7 Digital Booking Access</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#159EEC]" />
                <span className="text-sm font-bold text-[#1F2B6C]">Direct Access to Top Medical Specialists</span>
              </div>
            </div>
          </div>

          <div>
            <AppointmentForm />
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Trusted Specialists</span>
          <h2 className="text-3xl font-black text-[#1F2B6C]">Meet Our Medical Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} {...doctor} />
          ))}
        </div>
      </section>

      {/* Latest News & Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Medical News & Articles</span>
          <h2 className="text-3xl font-black text-[#1F2B6C]">Better Information, Better Health</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <NewsCard key={article.id} {...article} />
          ))}
        </div>
      </section>
    </div>
  );
};
