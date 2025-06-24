// src/database/seeds/seed.ts
import { BlogModel } from '../models/blog.schema';

const blogs = [
  {
    title: 'Blog Post 1',
    slug: 'blog-post-1',
    content: 'This is the content of blog post 1',
  },
  {
    title: 'Blog Post 2',
    slug: 'blog-post-2',
    content: 'This is the content of blog post 2',
  },

];

async function seed() {
  await BlogModel.create(blogs);
}

seed().catch(err => {
  console.error('Seeding error:', err);
}).finally(() => {
  process.exit(0);
});