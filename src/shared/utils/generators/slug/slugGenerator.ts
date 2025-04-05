import { Model, Document } from 'mongoose';

export async function handleSlug<T extends Document>(
  doc: T,
  field: keyof T,
  model: Model<T>
): Promise<string> {
  const baseSlug = doc[field].toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await model.findOne({ slug, _id: { $ne: doc._id } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}