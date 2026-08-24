import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, Mail, Phone, Clock, FileText, CheckCircle, ChevronDown } from 'lucide-react';

export interface AppointmentFormProps {
  preselectedDoctor?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ preselectedDoctor }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    email: '',
    phone: '',
    department: 'Cardiology',
    doctor: preselectedDoctor || 'Dr. Doctor Name',
    date: '',
    time: '09:00 AM',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
        <div className="w-16 h-16 bg-[#E8F5E9] text-[#28A745] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-[#1F2B6C]">Appointment Request Received!</h3>
        <p className="text-sm text-[#737373] max-w-md mx-auto">
          Thank you, <span className="font-semibold text-[#1F2B6C]">{formData.name}</span>. Your appointment request for{' '}
          <span className="font-semibold text-[#159EEC]">{formData.department}</span> with{' '}
          <span className="font-semibold text-[#1F2B6C]">{formData.doctor}</span> on{' '}
          <span className="font-semibold">{formData.date || 'your selected date'}</span> has been sent to our medical reception.
        </p>
        <div className="pt-4">
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-[#159EEC] hover:bg-[#1F2B6C] text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1F2B6C] p-6 sm:p-10 rounded-2xl shadow-2xl text-white space-y-6">
      <div className="text-center sm:text-left">
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Book an Appointment</h3>
        <p className="text-xs sm:text-sm text-[#BFD2F8]">
          Please fill in your details below and our hospital team will confirm your slot within 2 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#159EEC] transition-colors"
            />
          </div>
        </div>

        {/* Gender Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Gender *
          </label>
          <div className="relative">
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#159EEC] transition-colors"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#159EEC] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#159EEC] transition-colors"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              placeholder="(237) 681-812-255"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#159EEC] transition-colors"
            />
          </div>
        </div>

        {/* Department Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Department *
          </label>
          <div className="relative">
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#159EEC] transition-colors"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Practice">General Practice</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#159EEC] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Doctor Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Doctor *
          </label>
          <div className="relative">
            <select
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#159EEC] transition-colors"
            >
              <option value="Dr. Doctor Name">Dr. Doctor Name (Cardiologist)</option>
              <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Neurologist)</option>
              <option value="Dr. Michael Chang">Dr. Michael Chang (Pediatrician)</option>
              <option value="Dr. Emily Roberts">Dr. Emily Roberts (Orthopedist)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#159EEC] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Preferred Date *
          </label>
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#159EEC] transition-colors"
            />
          </div>
        </div>

        {/* Time Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
            Preferred Time *
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#159EEC] transition-colors"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#159EEC] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#BFD2F8] mb-1">
          Message / Medical History Summary
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-[#159EEC] absolute left-3.5 top-3.5" />
          <textarea
            rows={3}
            placeholder="Briefly describe your symptoms or reason for visit..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-[#2A3982] border border-[#3D4F9F] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#159EEC] transition-colors resize-none"
          ></textarea>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#BFD2F8] text-[#1F2B6C] hover:bg-[#159EEC] hover:text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-lg uppercase tracking-wider"
      >
        Submit Appointment Request
      </button>
    </form>
  );
};
