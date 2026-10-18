import React from 'react';
import { Page } from '../types';
import RouteLink from '../components/RouteLink';
import JsonLd from '../components/JsonLd';
import { BlogPost as BlogPostData, BlogBlock, blogPostBySlug } from '../content/blog';
import { PAGE_META, SITE_URL, canonicalUrl } from '../config/routes';

interface BlogPostProps {
  post: BlogPostData;
  onNavigate: (page: Page) => void;
}

const LINK_CLASS = 'inline font-bold text-[#2D6E5F] underline underline-offset-2 hover:text-[#245A4E]';

export const formatBlogDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const pageForPath = (path: string) =>
  (Object.entries(PAGE_META) as [Page, { path: string }][]).find(([, meta]) => meta.path === path)?.[0];

// Renders [text](/path) as an in-app link. An unknown path throws, so a broken link fails the prerender
// (the error page is rejected) instead of shipping.
const RichText: React.FC<{ text: string; onNavigate: (page: Page) => void }> = ({ text, onNavigate }) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[([^\]]+)\]\((\/[^)]*)\)/g)) {
    const [whole, label, path] = match;
    const page = pageForPath(path);
    if (!page) throw new Error(`Blog link to unknown route: ${path}`);
    parts.push(text.slice(last, match.index));
    parts.push(<RouteLink key={match.index} page={page} onNavigate={onNavigate} className={LINK_CLASS}>{label}</RouteLink>);
    last = match.index! + whole.length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
};

const Block: React.FC<{ block: BlogBlock; onNavigate: (page: Page) => void }> = ({ block, onNavigate }) =>
  block.type === 'p' ? (
    <p className="text-slate-700 leading-relaxed mb-4"><RichText text={block.text} onNavigate={onNavigate} /></p>
  ) : (
    <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed mb-4 marker:text-[#2D6E5F]">
      {block.items.map(item => <li key={item}><RichText text={item} onNavigate={onNavigate} /></li>)}
    </ul>
  );

const BlogPost: React.FC<BlogPostProps> = ({ post, onNavigate }) => {
  const related = post.related.map(slug => {
    const p = blogPostBySlug(slug);
    if (!p) throw new Error(`Related blog post not found: ${slug}`);
    return p;
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.meta.description,
          datePublished: post.datePublished,
          dateModified: post.datePublished,
          inLanguage: 'en-GB',
          mainEntityOfPage: canonicalUrl(post.meta.path),
          author: { '@type': 'Organization', name: 'Airola', url: SITE_URL },
          publisher: {
            '@type': 'Organization',
            name: 'Airola',
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
          },
        }}
      />

      <p className="mb-6 text-sm">
        <RouteLink page={Page.BLOG} onNavigate={onNavigate} className={LINK_CLASS}>Blog</RouteLink>
      </p>
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{post.title}</h1>
      <p className="text-sm text-slate-600 mb-10">
        By Airola · <time dateTime={post.datePublished}>{formatBlogDate(post.datePublished)}</time>
      </p>

      {post.intro.map(text => (
        <p key={text} className="text-lg text-slate-700 leading-relaxed mb-6"><RichText text={text} onNavigate={onNavigate} /></p>
      ))}

      {post.sections.map(section => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{section.heading}</h2>
          {section.blocks.map((block, i) => <Block key={i} block={block} onNavigate={onNavigate} />)}
        </section>
      ))}

      <section aria-labelledby="blog-faq-heading" className="mt-12 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 id="blog-faq-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
        {post.faq.map(item => (
          <div key={item.q} className="mb-6 last:mb-0">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
            <p className="text-slate-700 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </section>

      <nav aria-labelledby="blog-related-heading" className="mt-12">
        <h2 id="blog-related-heading" className="text-2xl font-bold text-slate-900 mb-4">Keep reading</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {related.map(p => (
            <li key={p.slug}>
              <RouteLink page={p.page} onNavigate={onNavigate} className="block h-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm font-bold text-slate-900 hover:border-[#2D6E5F] hover:text-[#2D6E5F] transition-colors">
                {p.title}
              </RouteLink>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
};

export default BlogPost;
