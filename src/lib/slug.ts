/**
 * Auto-generates clean URL slugs from Arabic or English text.
 */
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0600-\u06FF\-]+/g, '') // Remove all non-word chars (except Arabic unicode and hyphens)
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
