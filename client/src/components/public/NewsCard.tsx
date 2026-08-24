import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';

export interface NewsCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  views: number;
  imageUrl: string;
  snippet: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  category,
  date,
  author,
  views,
  imageUrl,
  snippet,
}) => {
  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between group">
      <div>
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-4 left-4 bg-[#159EEC] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {category}
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 text-xs text-[#737373] mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#159EEC]" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#159EEC]" />
              {author}
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              <Eye className="w-3.5 h-3.5 text-[#737373]" />
              {views}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#1F2B6C] mb-2 line-clamp-2 group-hover:text-[#159EEC] transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-xs text-[#737373] line-clamp-3 leading-relaxed mb-4">
            {snippet}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0">
        <Link
          to={`/news/${id}`}
          className="inline-flex items-center gap-2 bg-[#F4F9FF] text-[#1F2B6C] hover:bg-[#159EEC] hover:text-white px-5 py-2 rounded-full text-xs font-bold transition-all"
        >
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
