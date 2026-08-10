import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { Post, Taxonomy, MetaData } from '~/types';
import { APP_BLOG } from 'astrowind:config';
import { cleanSlug, trimSlash, BLOG_BASE, POST_PERMALINK_PATTERN, CATEGORY_BASE, TAG_BASE } from './permalinks';

// ---------------------------------------------------------------------------
// Local content collection blog (no external CMS dependency).
// Posts live as Markdown/MDX files in src/data/post/ and are rendered at
// build time by Astro. All exported helpers keep the same API as before so
// every page and component keeps working without changes.
// ---------------------------------------------------------------------------

/**
 * Estimate reading time from plain text (rough: 200 words/min).
 */
function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Extract FAQ entries from a post body.
 *
 * Supports two common Markdown FAQ formats:
 *   1. `### Question` followed by a paragraph (answer)
 *   2. `**Question?**` followed by a paragraph (answer)
 *
 * Only the section under a `## FAQ` (or `## FAQ ...`) heading is scanned.
 * Returns [] when no FAQ section is present, so pages without FAQs emit no schema.
 */
export function extractFaqs(body: string): { question: string; answer: string }[] {
  if (!body) return [];

  // Locate the FAQ section: `## FAQ` (optionally with a suffix such as "## FAQ — ...").
  const faqHeading = /^##\s+FAQ(?:\s*[—:-]\s*.*)?\s*$/im;
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => faqHeading.test(line.trim()));
  if (start === -1) return [];

  const faqs: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string[] } | null = null;

  const flush = () => {
    if (current && current.answer.length) {
      const answer = current.answer.join(' ').trim();
      if (answer) {
        faqs.push({ question: current.question, answer });
      }
    }
    current = null;
  };

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Stop at the next top-level heading (## …) that is not part of the FAQ section.
    if (/^##\s+/.test(line) && !/^##\s+FAQ(?:\s*[—:-]\s*.*)?\s*$/i.test(line)) {
      break;
    }

    // H3 heading → question (format 1)
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flush();
      current = { question: h3[1].trim(), answer: [] };
      continue;
    }

    // Bold run-in question → question (format 2: **Question?**)
    const bold = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (bold) {
      flush();
      current = { question: bold[1].trim(), answer: [] };
      continue;
    }

    // Accumulate answer paragraphs for the current question.
    if (current && line) {
      current.answer.push(line.replace(/^[*_-]\s+/, ''));
    }

    // Blank line between Q&A blocks: keep the current question open until the next heading,
    // so multi-paragraph answers are captured correctly.
  }
  flush();

  return faqs;
}

/**
 * Normalise a local content-collection entry into our internal Post shape.
 */
async function normalizeEntry(entry: Awaited<ReturnType<typeof getCollection>>[number]): Promise<Post> {
  const { Content } = await render(entry);

  const category: Taxonomy | undefined = entry.data.category
    ? { slug: cleanSlug(entry.data.category), title: entry.data.category }
    : undefined;

  const tags: Taxonomy[] = (entry.data.tags ?? []).map((t) => ({
    slug: cleanSlug(t),
    title: t,
  }));

  // Astro 6 content-layer entries expose `id` (the file slug) but no `slug` field.
  const slug = entry.id;

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');

  return {
    id: entry.id,
    slug,
    permalink,

    publishDate: entry.data.publishDate ?? new Date(),
    updateDate: entry.data.updateDate,

    title: entry.data.title,
    excerpt: entry.data.excerpt,
    image: entry.data.image,

    category,
    tags,
    author: entry.data.author,

    draft: entry.data.draft,

    metadata: entry.data.metadata as MetaData | undefined,

    Content,

    faqs: extractFaqs(entry.body ?? ''),

    readingTime: estimateReadingTime(entry.body ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Caching layer
// ---------------------------------------------------------------------------
let _posts: Array<Post> | undefined;

const load = async (): Promise<Array<Post>> => {
  const entries = await getCollection('post', ({ data }) => !data.draft);
  const posts = await Promise.all(entries.map(normalizeEntry));
  return posts.sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf());
};

// ---------------------------------------------------------------------------
// Exports — same API as before so all pages keep working
// ---------------------------------------------------------------------------

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }
  return _posts;
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findPostsByIds = async (ids: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();

  return ids.reduce(function (r: Array<Post>, id: string) {
    posts.some(function (post: Post) {
      return id === post.id && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findLatestPosts = async ({ count }: { count?: number }): Promise<Array<Post>> => {
  const _count = count || 4;
  const posts = await fetchPosts();

  return posts ? posts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  return paginate(await fetchPosts(), {
    params: { blog: BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: post.permalink,
    },
    props: { post },
  }));
};

/** */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

  const posts = await fetchPosts();
  const categories: Record<string, Taxonomy> = {};
  posts.map((post) => {
    if (post.category?.slug) {
      categories[post.category.slug] = post.category;
    }
  });

  return Array.from(Object.keys(categories)).flatMap((categorySlug) =>
    paginate(
      posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
      {
        params: { category: categorySlug, blog: CATEGORY_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { category: categories[categorySlug] },
      }
    )
  );
};

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const posts = await fetchPosts();
  const tags: Record<string, Taxonomy> = {};
  posts.map((post) => {
    if (Array.isArray(post.tags)) {
      post.tags.map((tag) => {
        tags[tag.slug] = tag;
      });
    }
  });

  return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
    paginate(
      posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
      {
        params: { tag: tagSlug, blog: TAG_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { tag: tags[tagSlug] },
      }
    )
  );
};

/** */
export async function getRelatedPosts(originalPost: Post, maxResults: number = 4): Promise<Post[]> {
  const allPosts = await fetchPosts();
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}
