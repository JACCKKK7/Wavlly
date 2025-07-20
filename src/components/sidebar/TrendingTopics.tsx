import React from 'react';
import { TrendingUp } from 'lucide-react';

const trendingTopics = [
  { tag: '#WebDesign', posts: '12.3k posts' },
  { tag: '#React', posts: '8.7k posts' },
  { tag: '#Photography', posts: '15.2k posts' },
  { tag: '#TechTips', posts: '5.9k posts' },
  { tag: '#UIUXDesign', posts: '9.8k posts' },
];

export function TrendingTopics() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
      </div>
      
      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                  {topic.tag}
                </h4>
                <p className="text-sm text-gray-500">{topic.posts}</p>
              </div>
              <div className="text-sm text-gray-400">#{index + 1}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
        View all trends
      </button>
    </div>
  );
}