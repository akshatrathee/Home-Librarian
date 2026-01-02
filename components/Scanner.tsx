import React, { useRef, useState, useEffect } from 'react';
import { scanBookImage } from '../services/geminiService';
import { fetchBookByIsbn } from '../services/openLibraryService';
import { Book, BookCondition, ReadStatus } from '../types';
import { generateId, loadState } from '../services/storageService';

interface ScannerProps {
  onScanComplete: (book: Book) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [mode, setMode] = useState<'barcode' | 'cover' | null>(null);

  useEffect(() => {
    if (mode) startCamera();
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      if (mode === 'barcode') startBarcodeDetection();
    } catch (e) {
      console.error(e);
      setStatus("Camera access error");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const startBarcodeDetection = () => {
      // @ts-ignore
      if (!('BarcodeDetector' in window)) return setStatus("Barcode API not supported");
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'isbn_13'] });
      const interval = setInterval(async () => {
          if (videoRef.current && !isScanning) {
              try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes.length > 0) {
                      clearInterval(interval);
                      handleIsbn(barcodes[0].rawValue);
                  }
              } catch {}
          }
      }, 500);
  };

  const handleIsbn = async (isbn: string) => {
      setIsScanning(true);
      setStatus(`Found ISBN: ${isbn}`);
      const book = await fetchBookByIsbn(isbn);
      if (book) finish(book);
      else setStatus("Book not found via ISBN");
      setIsScanning(false);
  };

  const captureCover = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      setIsScanning(true);
      setStatus("Analyzing cover...");
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const image = canvasRef.current.toDataURL('image/jpeg');
      try {
          const state = loadState();
          const book = await scanBookImage(image, state.aiSettings);
          finish({ ...book, coverUrl: image });
      } catch {
          setStatus("Analysis failed");
      }
      setIsScanning(false);
  };

  const finish = (partial: Partial<Book>) => {
      onScanComplete({
          id: generateId(),
          isbn: partial.isbn || 'UNKNOWN',
          title: partial.title || 'Unknown Title',
          author: partial.author || 'Unknown',
          genres: partial.genres || [],
          tags: [],
          condition: BookCondition.GOOD,
          isFirstEdition: false,
          isSigned: false,
          addedDate: new Date().toISOString(),
          addedByUserId: 'current',
          status: ReadStatus.UNREAD,
          coverUrl: partial.coverUrl,
          summary: partial.summary,
          estimatedValue: partial.estimatedValue || 0,
          purchasePrice: 0,
          minAge: partial.minAge,
          parentalAdvice: partial.parentalAdvice,
          understandingGuide: partial.understandingGuide,
          mediaAdaptations: partial.mediaAdaptations,
          culturalReference: partial.culturalReference,
          amazonLink: partial.amazonLink,
      });
  };

  if (mode) {
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <div className="relative flex-1 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 border-2 border-primary/50 rounded-2xl relative">
                          <div className="absolute inset-0 border-t-2 border-primary animate-scan opacity-50"></div>
                      </div>
                  </div>
                  {status && <div className="absolute bottom-32 w-full text-center text-white font-bold bg-black/50 py-2">{status}</div>}
              </div>
              <div className="h-32 bg-black flex items-center justify-around p-4">
                  <button onClick={() => setMode(null)} className="p-4 rounded-full bg-surface-highlight text-white"><span className="material-symbols-outlined">close</span></button>
                  {mode === 'cover' && (
                      <button onClick={captureCover} className="p-6 rounded-full bg-white text-black"><span className="material-symbols-outlined text-4xl">camera</span></button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col overflow-y-auto">
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <button onClick={onClose} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors active:scale-95">
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <span className="text-sm font-bold tracking-wide uppercase opacity-70">Add to Library</span>
        <div className="size-10"></div> 
      </nav>
      
      <main className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto p-5 gap-6">
        <div className="text-center space-y-2 py-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Add a Book</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Identify your book instantly using your camera or AI recognition.
          </p>
        </div>
        
        <div className="w-full space-y-5">
          <button onClick={() => setMode('barcode')} className="group relative w-full h-48 rounded-3xl overflow-hidden text-left shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all active:scale-[0.98]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBFRUn3pxBF3frlw-sqqxY3IVOAYth9seiPGd3XxH_FeXD4QWjwWLI2rwzII1pqu348Pn9noNQjQ-zRGB5htB-yjBnjM8Dle9QkMgUZamJ8dOrqgirKUby0XHMX-vICFuQ5i6jEz-UaB0H_54RcnfZfaDckBO2UmGtUBJCG6LdfCk9RbeDZV593Pyvva4fq55BKG6oAz9D5NZfniN5lMvb0cSHdmpKYUiKx7YsfQHgBl1tNgOYM6uuVrCr96AkVAbP55qI8q_m5mKad")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-gray-900/20 dark:from-black/95 dark:via-black/70 dark:to-black/30"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="size-12 rounded-2xl bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30 text-primary-light shadow-inner shadow-primary/20">
                <span className="material-symbols-outlined text-primary dark:text-blue-400">barcode_scanner</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Scan Barcode</h2>
                <p className="text-gray-300 text-sm font-medium">Capture ISBN for instant data</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => setMode('cover')} className="group relative w-full h-48 rounded-3xl overflow-hidden text-left shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none focus:ring-4 focus:ring-accent-purple/40 transition-all active:scale-[0.98]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAv4F_b7kIraPuRnakAvRy68EB0pSxZwlyV_wEtV5NpB3EDOOnSs57iZFWqk6dSPbANEPZKUbYfNW30j0R5TEGboSw7N5xWu9lmhsQWI6iKWE1DieUnOT4LQAm9C1CVNwKsOkvqKUgPfeHWobVFse5y09nEIROPSGr2dYdJCQ-q0X3KEJCYBl-CGYbKvqTqj5wdmK_flgAbUx2bA4Fu0mtDIAf0x2dSuno8mVqalh2Pto0RpIFeK9vtVuBIyRr4jubatgIJiuSzAe8L")'}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-gray-900/20 dark:from-black/95 dark:via-black/70 dark:to-black/30"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="size-12 rounded-2xl bg-purple-500/20 backdrop-blur-md flex items-center justify-center border border-purple-500/30 shadow-inner shadow-purple-500/20">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-300">shutter_speed</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">Snap Cover</h2>
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">AI Beta</span>
                </div>
                <p className="text-gray-300 text-sm font-medium">Recognition for older books</p>
              </div>
            </div>
          </button>
        </div>
        
        <button className="mt-4 flex items-center gap-2.5 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors py-3 px-6 rounded-full hover:bg-gray-200/50 dark:hover:bg-surface-dark group active:bg-gray-200 dark:active:bg-surface-dark/80">
          <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors">edit_square</span>
          <span className="font-medium text-sm">Enter ISBN or Title Manually</span>
        </button>
      </main>
    </div>
  );
};