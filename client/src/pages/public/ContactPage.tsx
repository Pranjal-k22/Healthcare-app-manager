import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / Contact</span>
          <h1 className="text-4xl sm:text-5xl font-black">Get In Touch With Us</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            We are here to answer your questions, assist with appointments, and provide emergency support 24/7.
          </p>
        </div>
      </section>

      {/* Info Cards Grid (4 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#159EEC] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1F2B6C] text-base">Emergency Call</h4>
            <p className="text-xs text-[#737373]">(237) 681-812-255</p>
            <p className="text-xs text-[#737373]">(237) 666-331-894</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1F2B6C] text-white p-6 rounded-2xl shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-[#BFD2F8] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Location</h4>
            <p className="text-xs text-[#BFD2F8]">0123 Real Street, City</p>
            <p className="text-xs text-[#BFD2F8]">9876 Some Station, State</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#159EEC] flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1F2B6C] text-base">Email Us</h4>
            <p className="text-xs text-[#737373]">fdedhospital@gmail.com</p>
            <p className="text-xs text-[#737373]">support@meddical.com</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#159EEC] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1F2B6C] text-base">Working Hours</h4>
            <p className="text-xs text-[#737373]">Mon - Sat: 08:00 - 20:00</p>
            <p className="text-xs text-[#737373]">Sunday: 09:00 - 15:00</p>
          </div>
        </div>
      </section>

      {/* Form & Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Get In Touch</span>
            <h2 className="text-3xl font-black text-[#1F2B6C] mb-6">Send Us a Message</h2>

            {isSubmitted ? (
              <div className="p-8 bg-[#F4F9FF] rounded-xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-[#28A745] mx-auto" />
                <h3 className="text-xl font-bold text-[#1F2B6C]">Message Sent Successfully!</h3>
                <p className="text-xs text-[#737373]">We will get back to your email within 24 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F2B6C] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F4F9FF] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1F2B6C] focus:outline-none focus:border-[#159EEC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F2B6C] mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F4F9FF] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1F2B6C] focus:outline-none focus:border-[#159EEC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F2B6C] mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="General Inquiry / Feedback"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F4F9FF] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1F2B6C] focus:outline-none focus:border-[#159EEC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F2B6C] mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#F4F9FF] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#1F2B6C] focus:outline-none focus:border-[#159EEC] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#159EEC] hover:bg-[#1F2B6C] text-white py-3 rounded-xl font-bold text-sm transition-all shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* Interactive Map Frame / Image Placeholder */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Hospital Location</span>
              <h2 className="text-3xl font-black text-[#1F2B6C] mb-6">Find Us On Map</h2>
            </div>

            <div className="w-full h-80 bg-[#BFD2F8] rounded-2xl overflow-hidden shadow-inner relative flex items-center justify-center border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
                alt="Hospital Location Map"
                className="w-full h-full object-cover"
              />
              <div className="absolute bg-[#1F2B6C] text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#159EEC]" />
                <div>
                  <p className="font-bold text-sm">Meddical Main Hospital</p>
                  <p className="text-xs text-[#BFD2F8]">0123 Real Street, City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
