import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Book, AiRecommendation, User, AiSettings, Persona } from '../types';
import { calculateAge } from './storageService';

// Gemini Schema
const bookSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isbn: { type: Type.STRING },
    title: { type: Type.STRING },
    author: { type: Type.STRING },
    summary: { type: Type.STRING },
    genres: { type: Type.ARRAY, items: { type: Type.STRING } },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    isFirstEdition: { type: Type.BOOLEAN },
    estimatedValue: { type: Type.NUMBER, description: "Estimated value in INR. Return a number ONLY." },
    totalPages: { type: Type.NUMBER },
    minAge: { type: Type.NUMBER },
    parentalAdvice: { type: Type.STRING },
    understandingGuide: { type: Type.STRING },
    mediaAdaptations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          youtubeLink: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    culturalReference: { type: Type.STRING }
  },
  required: ["title", "author", "genres", "minAge", "estimatedValue", "summary"]
};

const personaSchema: Schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            universe: { type: Type.STRING, description: "e.g. Marvel, Tolkien, Star Wars" },
            character: { type: Type.STRING, description: "e.g. Iron Man, Gandalf" },
            reason: { type: Type.STRING, description: "Why this user matches based on books" }
        }
    }
}

// --- HELPERS ---
const getApiKey = () => {
  // Check runtime injection first (Docker), then build-time env
  // @ts-ignore
  const runtimeKey = (typeof window !== 'undefined' && window.env?.API_KEY);
  return runtimeKey || process.env.API_KEY;
};

const getAi = (key?: string) => new GoogleGenAI({ apiKey: key || getApiKey() });

// --- GEMINI IMPLEMENTATION ---
const callGeminiImage = async (base64Image: string, settings: AiSettings) => {
  const apiKey = getApiKey();
  if(!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
          { inlineData: { mimeType: 'image/jpeg', data: data } },
          { text: `Analyze this book for the Home Librarian app (India context).
          1. Extract ISBN, Title, Author.
          2. PROVIDE A SUMMARY (approx 50 words).
          3. Estimated Value in INR (be realistic, used book market).
          4. Insights: Understanding Guide & Parental Advice.
          5. Media: Any movies/shows?
          6. Min Age.` }
      ]
    },
    config: { responseMimeType: "application/json", responseSchema: bookSchema }
  });
  return JSON.parse(response.text || "{}");
};

const callGeminiRecs = async (prompt: string) => {
  const ai = getAi();
  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}. Return JSON array.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['READ_NEXT', 'BUY_NEXT'] }
                }
            }
        }
      }
  });
  return JSON.parse(response.text || "[]");
};

const callGeminiPersonas = async (prompt: string) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: personaSchema
        }
    });
    return JSON.parse(response.text || "[]");
};

// --- OLLAMA IMPLEMENTATION (Simplistic) ---
const callOllama = async (settings: AiSettings, prompt: string, image?: string) => {
    try {
        const body: any = {
            model: settings.ollamaModel,
            prompt: prompt,
            stream: false,
            format: "json"
        };
        
        if (image) {
            body.images = [image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")];
        }

        const res = await fetch(`${settings.ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Ollama connection failed");
        
        const data = await res.json();
        return JSON.parse(data.response);
    } catch (e) {
        console.error("Ollama Error", e);
        throw e;
    }
};

// --- PUBLIC API ---

export const scanBookImage = async (base64Image: string, settings: AiSettings): Promise<Partial<Book>> => {
    if (settings.provider === 'ollama') {
        const prompt = "Analyze book cover. JSON: {isbn, title, author, summary, genres[], tags[], minAge (num), estimatedValue (num), parentalAdvice, understandingGuide, mediaAdaptations[{title, type}]}.";
        return await callOllama(settings, prompt, base64Image);
    }

    const result = await callGeminiImage(base64Image, settings);
    return {
        ...result,
        isFirstEdition: result.isFirstEdition || false,
        isSigned: false,
        condition: 'Good',
        tags: result.tags || [],
        genres: result.genres || [],
        mediaAdaptations: result.mediaAdaptations || [],
        amazonLink: `https://www.amazon.in/s?k=${encodeURIComponent((result.title || '') + ' ' + (result.author || ''))}`
    };
};

export const getRecommendations = async (
  user: User, 
  allBooks: Book[],
  type: 'READ_NEXT' | 'BUY_NEXT',
  settings: AiSettings
): Promise<AiRecommendation[]> => {
  
  const userAge = calculateAge(user.dob);

  const readBooks = user.history.slice(0, 15).map(h => {
    const b = allBooks.find(bk => bk.id === h.bookId);
    return b ? `${b.title} (${b.author})` : '';
  }).filter(Boolean).join(', ');

  const prompt = type === 'READ_NEXT' 
    ? `User (Age ${userAge}) has read: [${readBooks}]. Suggest 3 books from the provided LIBRARY_LIST that they haven't read. Focus on finding hidden gems or sequels.` 
    : `User (Age ${userAge}) has read: [${readBooks}]. Suggest 5 NEW books to buy (available in India).`;

  let libraryContext = "";
  if (type === 'READ_NEXT') {
      const unread = allBooks
        .filter(b => !user.history.find(h => h.bookId === b.id) && (userAge ? (b.minAge || 0) <= userAge : true))
        .map(b => `${b.title} by ${b.author}`);
      libraryContext = "LIBRARY_LIST: " + JSON.stringify(unread);
  }

  const finalPrompt = prompt + " " + libraryContext;

  if (settings.provider === 'ollama') {
      return await callOllama(settings, finalPrompt + " Format: JSON array [{title, author, reason, type}]");
  }

  return await callGeminiRecs(finalPrompt);
}

export const generatePersonas = async (user: User, allBooks: Book[], settings: AiSettings): Promise<Persona[]> => {
    const readHistory = user.history.map(h => {
        const b = allBooks.find(bk => bk.id === h.bookId);
        return b ? `${b.title} by ${b.author} (Genre: ${b.genres.join(',')})` : '';
    }).filter(Boolean).join('; ');

    const prompt = `Based on this reading history: [${readHistory}], assign 3 "Pop Culture Personas" to this user. 
    Examples: If they read Fantasy -> Universe: LOTR, Character: Bilbo. If SciFi -> Universe: Star Trek, Character: Data.
    Universes to choose from: Marvel, DC, Star Wars, Harry Potter, Tolkien, Disney, Star Trek, Sherlock Holmes, Game of Thrones.
    Return JSON array.`;

    if (settings.provider === 'ollama') {
        return await callOllama(settings, prompt + " Format: JSON array [{universe, character, reason}]");
    }
    
    return await callGeminiPersonas(prompt);
}

export const listOllamaModels = async (url: string) => {
    try {
        const res = await fetch(`${url}/api/tags`);
        const data = await res.json();
        return data.models.map((m: any) => m.name);
    } catch {
        return [];
    }
}