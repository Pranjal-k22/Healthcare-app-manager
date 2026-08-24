import React from 'react';
import { NewsCard } from '../../components/public/NewsCard';

export const NewsPage: React.FC = () => {
  const articlesList = [
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
    {
      id: 'article-3',
      title: 'Innovations in non-invasive surgical technologies.',
      category: 'Surgery',
      date: 'Friday 28, May 2026',
      author: 'By Dr. Doctor Name',
      views: 95,
      imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
      snippet: 'Robotic-assisted surgery leads to quicker recovery times, smaller incisions, and improved patient outcomes.',
    },
    {
      id: 'article-4',
      title: 'Pediatric immunizations: What every parent should know.',
      category: 'Pediatrics',
      date: 'Wednesday 10, April 2026',
      author: 'By Dr. Chang',
      views: 210,
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      snippet: 'An essential timeline of childhood vaccines, safety protocols, and immune health guidance for families.',
    },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F4F9FF]">
      {/* Header Banner */}
      <section className="bg-[#1F2B6C] text-white py-16 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#159EEC]">Home / News</span>
          <h1 className="text-4xl sm:text-5xl font-black">Blog & Medical Articles</h1>
          <p className="text-sm sm:text-base text-[#BFD2F8] max-w-2xl mx-auto leading-relaxed">
            Stay updated with clinical breakthroughs, wellness tips, and hospital announcements.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articlesList.map((article) => (
            <NewsCard key={article.id} {...article} />
          ))}
        </div>
      </section>
    </div>
  );
};
