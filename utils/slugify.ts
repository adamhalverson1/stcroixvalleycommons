// utils/slugify.ts
export function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')  // Replace spaces & non-alphanumerics with hyphens
      .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
  }
  