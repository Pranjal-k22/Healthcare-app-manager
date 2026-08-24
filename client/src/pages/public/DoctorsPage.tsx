import React, { useState } from 'react';
import { DoctorCard } from '../../components/public/DoctorCard';

export const DoctorsPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState('ALL');

  const doctorsList = [
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
    {
      id: '4',
      name: 'Dr. Emily Roberts',
      department: 'ORTHOPEDICS',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '5',
      name: 'Dr. James Wilson',
      department: 'CARDIOLOGY',
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '6',
      name: 'Dr. Maria Garcia',
      department: 'DERMATOLOGY',
      imageUrl: 'https://images.unsplash.com/photo-1594824813566-78a9c379a557?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const departments = ['ALL', 'NEUROLOGY', 'CARDIOLOGY', 'PEDIATRICS', 'ORTHOPEDICS', 'DERMATOLOGY'];

  const filteredDoctors =
    selectedDept === 'ALL'
      ? doctorsList
      : doctorsList.filter((doc) => doc.department === selectedDept);

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / Doctors</span>
          <h1 className="text-4xl sm:text-5xl font-black">Our Medical Specialists</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            Meet our team of board-certified consultants, surgeons, and healthcare practitioners dedicated to your well-being.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Doctor Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 bg-white p-2 rounded-full shadow-sm max-w-4xl mx-auto border border-gray-100">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                selectedDept === dept
                  ? 'bg-[#159EEC] text-white shadow'
                  : 'text-[#1F2B6C] hover:bg-[#F4F9FF]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} {...doc} />
          ))}
        </div>
      </section>
    </div>
  );
};
