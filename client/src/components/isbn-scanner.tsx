import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BrowserCodeReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { searchBookByIsbn, BookSearchResult } from '@/lib/book-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, Loader2, CheckCircle } from 'lucide-react';
import { BookCard } from './book-card';

interface IsbnScannerProps {
  onBookFound?: (book: BookSearchResult) => void;
  onAddToLibrary?: (book: BookSearchResult) => void;
  onAddToWishlist?: (book: BookSearchResult) => void;
}

export function IsbnScanner({ onBookFound, onAddToLibrary, onAddToWishlist }: IsbnScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedBook, setScannedBook] = useState<BookSearchResult | null>(null);
  const [lastScannedIsbn, setLastScannedIsbn] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserCodeReader | null>(null);
  
  // Mutation for searching book by ISBN
  const searchMutation = useMutation({
    mutationFn: async (isbn: string) => {
      console.log('Searching for ISBN:', isbn);
      const book = await searchBookByIsbn(isbn);
      if (!book) {
        throw new Error('Book not found');
      }
      return book;
    },
    onSuccess: (book) => {
      console.log('Book found:', book);
      setScannedBook(book);
      setError(null);
      onBookFound?.(book);
    },
    onError: (error) => {
      console.error('Error finding book:', error);
      setError('Book not found. Try scanning again or search manually.');
    }
  });

  // Initialize camera and barcode reader
  const startScanning = async () => {
    try {
      setError(null);
      setScannedBook(null);
      setLastScannedIsbn(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setHasPermission(true);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Error playing video:', playError);
        }
      }
      
      // Initialize barcode reader
      const codeReader = new BrowserCodeReader();
      codeReaderRef.current = codeReader;
      
      // Start scanning
      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log('Scanned:', scannedText);
            
            // Check if it's an ISBN (10 or 13 digits, possibly with hyphens)
            const isbnPattern = /^(?:\d{9}[\dX]|\d{13})$/;
            const cleanedText = scannedText.replace(/[-\s]/g, '');
            
            if (isbnPattern.test(cleanedText) && cleanedText !== lastScannedIsbn) {
              setLastScannedIsbn(cleanedText);
              searchMutation.mutate(cleanedText);
            }
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scanning error:', error);
          }
        });
      }
      
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  // Stop scanning and cleanup
  const stopScanning = () => {
    setIsScanning(false);
    
    // Stop the barcode reader
    if (codeReaderRef.current) {
      try {
        // Try to stop the reader gracefully
        codeReaderRef.current = null;
      } catch (err) {
        console.error('Error stopping code reader:', err);
      }
    }
    
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleAddToLibrary = () => {
    if (scannedBook && onAddToLibrary) {
      onAddToLibrary(scannedBook);
    }
  };

  const handleAddToWishlist = () => {
    if (scannedBook && onAddToWishlist) {
      onAddToWishlist(scannedBook);
    }
  };

  return (
    <div className="space-y-4" data-testid="isbn-scanner">
      {/* Camera Controls */}
      <div className="flex gap-2">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="flex items-center gap-2"
            data-testid="button-start-scanning"
          >
            <Camera className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-stop-scanning"
          >
            <CameraOff className="h-4 w-4" />
            Stop Camera
          </Button>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <Alert variant="destructive" data-testid="alert-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasPermission === false && (
        <Alert variant="destructive" data-testid="alert-permission">
          <AlertDescription>
            Camera access denied. Please enable camera permissions and refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Video */}
      {isScanning && (
        <Card className="relative overflow-hidden" data-testid="card-camera">
          <CardContent className="p-0">
            <video
              ref={videoRef}
              className="w-full max-h-96 object-cover"
              autoPlay
              playsInline
              muted
              data-testid="video-camera"
            />
            <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Point camera at book's barcode
            </div>
            {searchMutation.isPending && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching for book...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scanning Instructions */}
      {isScanning && !scannedBook && !searchMutation.isPending && (
        <Card data-testid="card-instructions">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-neutral-600">
              Position the book's barcode within the camera view. The scanner will automatically detect ISBN codes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success and Book Display */}
      {scannedBook && (
        <div className="space-y-4" data-testid="section-scanned-book">
          <Alert className="border-green-200 bg-green-50" data-testid="alert-success">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Book found! ISBN: {lastScannedIsbn}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <BookCard
              book={scannedBook}
              view="recommendation"
              onAddToLibrary={onAddToLibrary ? handleAddToLibrary : undefined}
              onAddToWishlist={onAddToWishlist ? handleAddToWishlist : undefined}
              actionLabel="Add to Library"
              data-testid="card-scanned-book"
            />
          </div>
        </div>
      )}
    </div>
  );
}