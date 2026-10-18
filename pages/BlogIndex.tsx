import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import { BLOG_POSTS } from '../content/blog';
import { formatBlogDate } from './BlogPost';

const BlogIndex: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Airbnb hosting blog</h1>
    <p className="text-lg text-slate-700 leading-relaxed mb-12">
      Practical guides for Airbnb and short-let hosts in East London: what turnover cleaning costs, what it should
      include, how long it takes, and how to keep same-day turnovers running smoothly.
    </p>

    <ul className="space-y-6">
      {BLOG_POSTS.map(post => (
        <li key={post.slug} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <article>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              <RouteLink page={post.page} onNavigate={onNavigate} className="inline text-left hover:text-[#2D6E5F] transition-colors">
                {post.title}
              </RouteLink>
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">{post.meta.description}</p>
            <RouteLink page={post.page} onNavigate={onNavigate} className="group inline-flex items-center font-bold text-[#2D6E5F] hover:text-[#245A4E]" aria-label={`Read: ${post.title}`}>
              Read the guide <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </RouteLink>
          </article>
        </li>
      ))}
    </ul>
  </div>
);

export default BlogIndex;
