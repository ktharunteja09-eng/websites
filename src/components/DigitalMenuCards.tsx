import React, { useState, useEffect } from 'react';
import { DIGITAL_MENU_PAGES } from '../data/restaurantData';
import { DigitalMenuPage } from '../types';
import { Upload, Image as ImageIcon, RotateCcw, Maximize2, X, CheckCircle, Sparkles } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

export const DigitalMenuCards: React.FC = () => {
  // Store custom uploaded images in state, initialized from localStorage if present
  const [uploadedPages, setUploadedPages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('vaibhav_digital_menu_uploads');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activePreview, setActivePreview] = useState<{
    page: DigitalMenuPage;
    currentImage: string;
  } | null>(null);

  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  // Save to localStorage whenever user uploads a new menu page photo
  useEffect(() => {
    try {
      localStorage.setItem('vaibhav_digital_menu_uploads', JSON.stringify(uploadedPages));
    } catch (e) {
      console.warn('Could not save uploaded menu card to localStorage', e);
    }
  }, [uploadedPages]);

  const handleFileUpload = (pageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB max for local preview)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please upload a compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedPages((prev) => ({
          ...prev,
          [pageId]: result
        }));
        setUploadSuccessId(pageId);
        setTimeout(() => setUploadSuccessId(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedPages((prev) => {
      const updated = { ...prev };
      delete updated[pageId];
      return updated;
    });
  };

  return (
    <div className="w-full space-y-8" id="digital-menu-cards-showcase">
      {/* Upload Instructions & Notice Banner with Dimensions Guide */}
      <div className="bg-[#2E4823]/5 border border-[#2E4823]/15 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E4823] text-[#FDFBF7] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-['Playfair_Display'] text-base sm:text-lg font-bold text-[#2E4823]">
              Digital Menu Booklet &amp; Photo Card Placeholders
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
              Browse our official menu book pages below. You can tap{' '}
              <strong>"Upload Menu Photo"</strong> on any slot to upload your own physical menu scans or dish photos anytime!
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-[#2E4823]">
              <span className="font-semibold bg-white px-2.5 py-1 rounded-md border border-[#2E4823]/15 shadow-xs">
                Recommended Card Dimensions: <strong>1200×1600px (3:4 ratio)</strong> or <strong>1200×900px (4:3)</strong>
              </span>
              <span className="font-semibold bg-white px-2.5 py-1 rounded-md border border-[#2E4823]/15 shadow-xs">
                Hero Big Banners: <strong>1600×900px (16:9 widescreen)</strong>
              </span>
            </div>
          </div>
        </div>

        {Object.keys(uploadedPages).length > 0 && (
          <button
            type="button"
            onClick={() => setUploadedPages({})}
            className="text-xs font-semibold text-[#D3452B] hover:text-[#b0341e] flex items-center gap-1.5 self-end sm:self-center shrink-0 px-3 py-1.5 rounded-lg border border-[#D3452B]/30 hover:bg-[#D3452B]/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Uploads</span>
          </button>
        )}
      </div>

      {/* 4 Digital Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {DIGITAL_MENU_PAGES.map((page) => {
          const customImage = uploadedPages[page.id];
          const displayImage = customImage || page.defaultPlaceholderImage;
          const isCustom = Boolean(customImage);

          return (
            <div
              key={page.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#2E4823]/15 shadow-[0_6px_24px_rgba(46,72,35,0.06)] flex flex-col transition-all duration-300 hover:shadow-[0_12px_32px_rgba(46,72,35,0.12)] hover:-translate-y-1 group"
            >
              {/* Header Bar of Card */}
              <div className="bg-[#2E4823] text-white px-4 py-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
                  Page {page.pageNumber}
                </span>
                <span className="text-[11px] text-white/80 font-medium">
                  {page.category}
                </span>
              </div>

              {/* Menu Card Image Area with Placeholder or Custom Upload */}
              <div
                className="relative aspect-[3/4] bg-[#1C1C1C] overflow-hidden cursor-pointer"
                onClick={() => setActivePreview({ page, currentImage: displayImage })}
              >
                <OptimizedImage
                  src={displayImage}
                  alt={`${page.title} - Menu Page ${page.pageNumber}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  containerClassName="w-full h-full"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Badge if custom image is active */}
                {isCustom && (
                  <div className="absolute top-3 left-3 bg-[#25D366] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 z-10">
                    <CheckCircle className="w-3 h-3" />
                    <span>Custom Uploaded</span>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                  <div className="bg-black/60 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Tap to view full page</span>
                  </div>
                </div>

                {/* Bottom Title on Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                  <h5 className="font-['Playfair_Display'] text-sm sm:text-base font-bold leading-tight drop-shadow">
                    {page.title}
                  </h5>
                  <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5">
                    {page.subtitle}
                  </p>
                </div>
              </div>

              {/* Dish Items Snapshot */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-[#FDFBF7]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                    Included Highlights:
                  </span>
                  <ul className="space-y-1 text-xs text-[#1C1C1C]/85">
                    {page.itemsPreview.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D3452B] shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upload Button & Action Controls */}
                <div className="mt-4 pt-3 border-t border-[#2E4823]/10 flex items-center gap-2">
                  <label
                    htmlFor={`upload-input-${page.id}`}
                    className="flex-1 cursor-pointer min-h-[38px] px-3 py-1.5 rounded-xl bg-[#2E4823] hover:bg-[#223719] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCustom ? 'Replace Photo' : 'Upload Menu Photo'}</span>
                  </label>
                  <input
                    id={`upload-input-${page.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(page.id, e)}
                  />

                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleReset(page.id, e)}
                      title="Reset to default placeholder"
                      className="w-9 h-9 rounded-xl border border-gray-300 text-gray-600 hover:text-[#D3452B] hover:border-[#D3452B] flex items-center justify-center transition-colors bg-white shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {uploadSuccessId === page.id && (
                  <p className="text-[11px] text-[#2E4823] font-semibold mt-1.5 text-center flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#2E4823]" />
                    <span>Menu photo updated successfully!</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen High-Resolution Lightbox for Digital Menu Page */}
      {activePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActivePreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activePreview.page.title}
        >
          <button
            type="button"
            onClick={() => setActivePreview(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-60 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePreview.currentImage}
              alt={activePreview.page.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <div className="mt-4 text-center text-white px-4">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                Page {activePreview.page.pageNumber} • {activePreview.page.category}
              </span>
              <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold mt-1">
                {activePreview.page.title}
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-md">
                {activePreview.page.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
