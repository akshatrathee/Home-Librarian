import React, { useRef, useState, useEffect } from 'react';
import { Icons } from './Icons';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<string>('Point camera at a barcode');
  const [mode, setMode] = useState<'barcode' | 'cover'>('barcode');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scanInterval = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if(scanInterval.current) window.clearInterval(scanInterval.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      // Start auto-detection loop if in barcode mode
      if (mode === 'barcode') {
          startBarcodeDetection();
      }
    } catch (err) {
      setStatus("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startBarcodeDetection = () => {
      // @ts-ignore
      if (!('BarcodeDetector' in window)) {
          setStatus("Native barcode detection not supported. Switching to Cover Scan.");
          setMode('cover');
          return;
      }

      // @ts-ignore
      const barcodeDetector = new window.BarcodeDetector({ formats: ['ean_13', 'isbn_13', 'ean_8'] });

      scanInterval.current = window.setInterval(async () => {
          if (videoRef.current && !isAnalyzing) {
              try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes.length > 0) {
                      const isbn = barcodes[0].rawValue;
                      handleBarcodeDetected(isbn);
                  }
              } catch (e) {
                  // Ignore detection errors (frame might be blurry)
              }
          }
      }, 500);
  };

  const handleBarcodeDetected = async (isbn: string) => {
      if (isAnalyzing) return;
      setIsAnalyzing(true);
      setStatus(`Barcode detected: ${isbn}. Fetching details...`);
      if(scanInterval.current) window.clearInterval(scanInterval.current);

      try {
          // 1. Try OpenLibrary
          const olBook = await fetchBookByIsbn(isbn);
          
          if (olBook) {
              // 2. Enhance with Gemini for missing details (MinAge, Value, etc)
              // We pass the OL data context to Gemini? Or just use defaults. 
              // To keep it simple/fast, we use OL data + defaults, and maybe kick off a background AI fill?
              // Let's use Gemini to fill in the gaps using the Title/Author from OL.
              
              const currentState = loadState();
              const prompt = `Book found: "${olBook.title}" by "${olBook.author}". 
                              Return JSON with estimatedValue (INR), minAge, parentalAdvice, understandingGuide, summary, genres, mediaAdaptations.`;
              
              // We don't send image here, just text prompt to save tokens/bandwidth
              // Note: We need a text-only gemini call function, reusing scanBookImage for now by passing a dummy image or modifying service.
              // For now, let's just accept the OL data and set defaults to avoid complex service refactoring in this step.
              // User can "Edit" to fill details with AI later.
              
              finishScan({
                  ...olBook,
                  id: generateId(),
                  condition: BookCondition.GOOD,
                  isFirstEdition: false,
                  isSigned: false,
                  addedDate: new Date().toISOString(),
                  addedByUserId: '',
                  estimatedValue: 0, // Placeholder
                  genres: olBook.genres || [],
                  tags: [],
                  status: ReadStatus.UNREAD
              } as Book);

          } else {
              setStatus("Barcode not found in database. Switching to visual scan...");
              captureAndAnalyze(); // Fallback to visual
          }
      } catch (e) {
          setStatus("Error fetching data. Try visual scan.");
          setIsAnalyzing(false);
      }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setStatus("Analyzing image with AI...");
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
      
      try {
        const currentState = loadState(); 
        const partialBook = await scanBookImage(imageBase64, currentState.aiSettings);
        
        finishScan({
          id: generateId(),
          isbn: partialBook.isbn || 'UNKNOWN',
          title: partialBook.title || 'Unknown Title',
          author: partialBook.author || 'Unknown Author',
          coverUrl: imageBase64, // Visual scan uses captured photo
          summary: partialBook.summary || '',
          genres: partialBook.genres || [],
          tags: partialBook.tags || [],
          totalPages: partialBook.totalPages || 0,
          isFirstEdition: partialBook.isFirstEdition || false,
          isSigned: false,
          condition: BookCondition.GOOD,
          estimatedValue: partialBook.estimatedValue || 0,
          addedDate: new Date().toISOString(),
          purchasePrice: partialBook.estimatedValue || 0,
          minAge: partialBook.minAge,
          parentalAdvice: partialBook.parentalAdvice,
          understandingGuide: partialBook.understandingGuide,
          mediaAdaptations: partialBook.mediaAdaptations,
          culturalReference: partialBook.culturalReference,
          amazonLink: partialBook.amazonLink,
          addedByUserId: '',
          status: ReadStatus.UNREAD
        });
        
      } catch (err) {
        setStatus("AI Analysis failed. Try again.");
        setIsAnalyzing(false);
      }
    }
  };

  const finishScan = (book: Book) => {
      onScanComplete(book);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-white">
          <Icons.Close size={24} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="absolute top-4 left-4 z-10 bg-slate-800 rounded-lg p-1 flex">
          <button 
             onClick={() => { setMode('barcode'); setStatus('Point camera at a barcode'); }}
             className={`px-3 py-1 rounded text-xs font-bold ${mode === 'barcode' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
              Barcode Auto
          </button>
          <button 
             onClick={() => { setMode('cover'); setStatus('Take a photo of the cover'); if(scanInterval.current) clearInterval(scanInterval.current); }}
             className={`px-3 py-1 rounded text-xs font-bold ${mode === 'cover' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
              Cover Visual
          </button>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 overflow-hidden rounded-lg shadow-2xl border border-slate-700">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlays */}
        <div className="absolute inset-0 border-2 border-indigo-500/50 pointer-events-none flex flex-col items-center justify-center">
            {mode === 'barcode' && (
                <div className="w-64 h-24 border-2 border-red-500/80 rounded animate-pulse"></div>
            )}
            {mode === 'cover' && (
                <div className="w-64 h-80 border-2 border-indigo-400/50 rounded-lg"></div>
            )}
        </div>

        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-4 text-center">
            <p className="text-white font-medium animate-pulse">{status}</p>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-white text-lg">Processing...</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        {mode === 'cover' && (
            <button 
            onClick={captureAndAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            >
            <Icons.Camera size={24} />
            Capture Cover
            </button>
        )}
        {mode === 'barcode' && (
            <p className="text-slate-500 text-sm">Automatically scanning for barcodes...</p>
        )}
      </div>
    </div>
  );
};