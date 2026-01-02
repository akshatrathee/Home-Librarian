import { Book } from '../types';

interface OpenLibraryResponse {
  [key: string]: {
    title: string;
    authors?: { name: string }[];
    cover?: { medium: string; large: string };
    identifiers?: { isbn_13?: string[]; isbn_10?: string[] };
    number_of_pages?: number;
    publish_date?: string;
    publishers?: { name: string }[];
    subjects?: { name: string }[];
  }
}

export const fetchBookByIsbn = async (isbn: string): Promise<Partial<Book> | null> => {
  try {
    const cleanIsbn = isbn.replace(/-/g, '').trim();
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`);
    const data: OpenLibraryResponse = await response.json();
    const bookData = data[`ISBN:${cleanIsbn}`];

    if (!bookData) return null;

    return {
      isbn: cleanIsbn,
      title: bookData.title,
      author: bookData.authors?.map(a => a.name).join(', ') || 'Unknown Author',
      coverUrl: bookData.cover?.large || bookData.cover?.medium || undefined,
      totalPages: bookData.number_of_pages,
      publishedDate: bookData.publish_date,
      publisher: bookData.publishers?.[0]?.name,
      genres: bookData.subjects?.slice(0, 3).map(s => s.name) || [],
      tags: [],
      minAge: 0, // OpenLibrary doesn't typically provide this, assume 0 or infer later
      summary: `Published by ${bookData.publishers?.[0]?.name || 'Unknown'} in ${bookData.publish_date}.`
    };
  } catch (error) {
    console.error("OpenLibrary Fetch Error", error);
    return null;
  }
};
