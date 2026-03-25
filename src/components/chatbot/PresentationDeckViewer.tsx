'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Eye, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Deck {
  id: string;
  title: string;
  description: string;
  fileName: string;
  thumbnailUrl: string;
}

interface PresentationDeckViewerProps {
  distributorId: string;
  onComplete?: () => void;
}

const DECKS: Deck[] = [
  {
    id: 'business-overview',
    title: 'Business Overview',
    description: 'Complete Apex Affinity Group overview',
    fileName: 'Business Overview - Apex Affinity Group.pptx.pdf',
    thumbnailUrl: '/decks/Business Overview - Apex Affinity Group.pptx.pdf',
  },
  {
    id: 'compensation-plan',
    title: 'Compensation Plan',
    description: 'How you earn money with Apex',
    fileName: 'Licensed Insurance Compensation Plan - Apex Affinity Group.pptx (1).pdf',
    thumbnailUrl: '/decks/Licensed Insurance Compensation Plan - Apex Affinity Group.pptx (1).pdf',
  },
  {
    id: 'ai-products',
    title: 'AI-Powered Products',
    description: 'The technology edge that sets us apart',
    fileName: 'The AI Powered Products of Apex Affinity Group.pptx.pdf',
    thumbnailUrl: '/decks/The AI Powered Products of Apex Affinity Group.pptx.pdf',
  },
  {
    id: 'first-48-hours',
    title: 'First 48 Hours Guide',
    description: 'Getting started roadmap for new members',
    fileName: 'The First 48 Hours - F.3-22.pptx.pdf',
    thumbnailUrl: '/decks/The First 48 Hours - F.3-22.pptx.pdf',
  },
];

export default function PresentationDeckViewer({
  distributorId,
  onComplete,
}: PresentationDeckViewerProps) {
  const [viewedDecks, setViewedDecks] = useState<Set<string>>(new Set());
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);

  const handleViewDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentPage(1);
    setPdfLoading(true);

    // Mark as viewed
    if (!viewedDecks.has(deck.id)) {
      const newViewedDecks = new Set(viewedDecks);
      newViewedDecks.add(deck.id);
      setViewedDecks(newViewedDecks);

      // Check if all decks are now viewed
      if (newViewedDecks.size === DECKS.length && onComplete) {
        // Delay completion callback slightly to allow user to see the checkmark
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  };

  const handleDownload = (deck: Deck) => {
    const link = document.createElement('a');
    link.href = `/decks/${deck.fileName}`;
    link.download = deck.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setSelectedDeck(null);
    setCurrentPage(1);
    setNumPages(0);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  };

  const progressText = `${viewedDecks.size} of ${DECKS.length} decks reviewed`;

  return (
    <>
      <div className="space-y-4 my-4">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {viewedDecks.size}
            </div>
            <div>
              <div className="font-semibold text-blue-900">Review Progress</div>
              <div className="text-sm text-blue-700">{progressText}</div>
            </div>
          </div>
          {viewedDecks.size === DECKS.length && (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <Check className="w-5 h-5" />
              All Complete!
            </div>
          )}
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DECKS.map((deck) => {
            const isViewed = viewedDecks.has(deck.id);

            return (
              <Card
                key={deck.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  isViewed ? 'border-green-500 border-2' : 'border-slate-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail/Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2B4C7E] to-[#1e3557] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {deck.title}
                        </h3>
                        {isViewed && (
                          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {deck.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDeck(deck)}
                          className="flex-1 bg-[#2B4C7E] hover:bg-[#1e3557] text-white h-8 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(deck)}
                          className="flex-1 h-8 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedDeck && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedDeck.title}
                </h2>
                <p className="text-sm text-slate-600">{selectedDeck.description}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-y-auto bg-slate-100 flex flex-col items-center p-6">
              {pdfLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-slate-600">Loading presentation...</div>
                </div>
              )}

              <Document
                file={`/decks/${selectedDeck.fileName}`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading=""
                className="max-w-full"
              >
                <Page
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                  width={Math.min(800, window.innerWidth - 100)}
                />
              </Document>
            </div>

            {/* Page Navigation */}
            {numPages > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="text-sm text-slate-600 font-medium">
                  Page {currentPage} of {numPages}
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={currentPage === numPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
