'use client';

// =============================================
// Business Card Preview Renderer
// Renders template elements with user data
// =============================================

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CardElement {
  id: string;
  type: 'text' | 'image';
  field: string | null;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  zIndex: number;
}

interface Props {
  elements: CardElement[];
  userData: Record<string, string>;
  side: 'front' | 'back';
  distributorSlug?: string;
  includeQR?: boolean;
}

export default function CardPreviewRenderer({
  elements,
  userData,
  side,
  distributorSlug,
  includeQR = false,
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR code if needed
  useEffect(() => {
    if (includeQR && distributorSlug) {
      QRCode.toDataURL(`https://theapexway.net/${distributorSlug}`, {
        width: 120,
        margin: 1,
        color: {
          dark: '#2B4C7E',
          light: '#00000000',
        },
      }).then(setQrDataUrl);
    }
  }, [includeQR, distributorSlug]);

  // Render element with user data
  const renderElement = (element: CardElement) => {
    // Get content - use user data if field is mapped, otherwise use placeholder
    let content = element.content;
    if (element.field && userData[element.field]) {
      content = userData[element.field];
    }

    // Special handling for QR code field
    if (element.field === 'qr_code' && qrDataUrl) {
      return (
        <img
          src={qrDataUrl}
          alt="QR Code"
          style={{
            width: `${element.width}px`,
            height: `${element.height}px`,
          }}
        />
      );
    }

    // Hide element if it's a dynamic field but user hasn't provided data
    if (element.field && !userData[element.field] && element.field !== 'qr_code') {
      return null;
    }

    // Render based on type
    if (element.type === 'text') {
      return (
        <div
          style={{
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            fontFamily: element.fontFamily || 'Inter',
            color: element.color,
            textAlign: element.textAlign,
            minWidth: `${element.width}px`,
            minHeight: `${element.height}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <img
          src={content}
          alt="Card element"
          style={{
            width: `${element.width}px`,
            height: `${element.height}px`,
            objectFit: 'contain',
          }}
        />
      );
    }

    return null;
  };

  return (
    <div
      className="relative bg-gray-100 mx-auto"
      style={{
        width: '350px',
        height: '200px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {elements.map((element) => {
        const renderedElement = renderElement(element);
        if (!renderedElement) return null;

        return (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: element.zIndex,
            }}
          >
            {renderedElement}
          </div>
        );
      })}
    </div>
  );
}
