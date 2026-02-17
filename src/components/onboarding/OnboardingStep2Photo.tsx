'use client';

// =============================================
// Onboarding Step 2: Profile Photo Upload
// =============================================

import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Distributor } from '@/lib/types';

interface Step2Props {
  distributor: Distributor;
  onNext: () => void;
  onBack: () => void;
  updateDistributor: (updates: Partial<Distributor>) => void;
}

export default function OnboardingStep2Photo({
  distributor,
  onNext,
  onBack,
  updateDistributor,
}: Step2Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>(distributor.profile_photo_url || '');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityCheck, setQualityCheck] = useState<{
    passed: boolean;
    message: string;
    issues?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setSelectedFile(file);
      setShowCropper(true);
      setQualityCheck(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    const croppedImageData = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImage(croppedImageData);
    setShowCropper(false);

    // Convert to file for upload
    const blob = await (await fetch(croppedImageData)).blob();
    const croppedFile = new File([blob], selectedFile?.name || 'photo.jpg', {
      type: 'image/jpeg',
    });
    setSelectedFile(croppedFile);

    // Auto-analyze quality - set analyzing state first
    setIsAnalyzing(true);
    setTimeout(() => analyzeQuality(croppedFile), 100);
  };

  const analyzeQuality = async (file: File) => {
    console.log('🔍 Starting photo quality analysis...');
    setIsAnalyzing(true);
    setQualityCheck(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        console.log('📸 Image converted to base64, sending to API...');

        const response = await fetch('/api/ai/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        console.log('📡 API response status:', response.status);

        const result = await response.json();
        console.log('📦 Full API response:', result);

        if (response.ok && result.success) {
          console.log('✅ Analysis result:', result.data);
          if (result.data) {
            setQualityCheck(result.data);
          }
        } else {
          console.warn('⚠️ AI analysis unavailable:', result.message);
          // Set a basic pass-through quality check instead of failing
          setQualityCheck({
            passed: true,
            message: 'Photo uploaded successfully. AI analysis unavailable.',
            issues: []
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error analyzing photo:', error);
    } finally {
      setIsAnalyzing(false);
      console.log('✅ Analysis complete');
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;

    setIsEnhancing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const response = await fetch('/api/ai/enhance-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.enhanced) {
            setCroppedImage(result.data.enhanced);
            const enhancedBlob = await (await fetch(result.data.enhanced)).blob();
            const enhancedFile = new File([enhancedBlob], selectedFile.name, {
              type: selectedFile.type,
            });
            setSelectedFile(enhancedFile);
            analyzeQuality(enhancedFile);
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error enhancing photo:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onNext();
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data) {
          updateDistributor(result.data);
        }
        onNext();
      } else {
        console.error('Upload failed:', result.message);
        alert(result.message || 'Failed to upload photo. Please try again.');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('An error occurred while uploading. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4 px-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2B4E7E] mb-2">Profile Photo</h2>
        <p className="text-gray-700 text-base sm:text-lg">
          Add a professional photo to build trust with prospects
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {showCropper ? (
          // Cropper View
          <div className="mb-4">
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Control */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Crop Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCropper(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Crop
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Photo Preview */}
            <div className="mb-4">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-[#2B4E7E] mb-4">
                  {croppedImage ? (
                    <img src={croppedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl font-bold">
                      {distributor.first_name[0]}
                      {distributor.last_name[0]}
                    </div>
                  )}
                </div>

                {/* Upload & Enhance Buttons */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex gap-3 w-full max-w-md">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-6 py-2 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {croppedImage ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {selectedFile && (
                    <button
                      onClick={handleEnhance}
                      disabled={isEnhancing || (qualityCheck?.passed === true)}
                      className="flex-1 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={qualityCheck?.passed ? 'Photo quality is already good!' : 'Enhance photo quality'}
                    >
                      {isEnhancing ? '✨ Enhancing...' : '✨ AI Enhance'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quality Check Results */}
            {isAnalyzing && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔍</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">
                      AI is analyzing your photo...
                    </h4>
                    <p className="text-xs text-blue-800">
                      Checking quality, lighting, clarity, and professionalism
                    </p>
                  </div>
                </div>
              </div>
            )}

            {qualityCheck && (
              <div
                className={`mb-4 p-4 border rounded-lg ${
                  qualityCheck.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <h4
                  className={`font-semibold text-sm mb-1 ${
                    qualityCheck.passed ? 'text-green-900' : 'text-yellow-900'
                  }`}
                >
                  {qualityCheck.passed ? '✅ Quality Check Passed - No Image Enhancement Needed' : '⚠️ Photo Could Be Better'}
                </h4>
                {!qualityCheck.passed && (
                  <p
                    className={`text-xs ${
                      qualityCheck.passed ? 'text-green-800' : 'text-yellow-800'
                    }`}
                  >
                    {qualityCheck.message}
                  </p>
                )}
                {qualityCheck.issues && qualityCheck.issues.length > 0 && (
                  <>
                    <ul className="mt-2 text-xs text-yellow-800 space-y-1">
                      {qualityCheck.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-yellow-900 font-semibold">
                      💡 Try using the <span className="text-purple-600">AI Enhance</span> button above to improve picture quality!
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">💡 Photo Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a well-lit, professional-looking photo</li>
                <li>• Face should be clearly visible and centered</li>
                <li>• Avoid sunglasses, hats, or filters</li>
                <li>• Solid background works best</li>
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-6 py-3 bg-[#2B4E7E] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Continue →'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 pt-4">
              You can skip this and add your photo later from your profile
            </p>
          </>
        )}
      </div>
    </div>
  );
}
