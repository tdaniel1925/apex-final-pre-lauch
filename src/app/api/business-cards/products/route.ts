// GET /api/business-cards/products
// Queries Printful catalog and returns business card products + variant IDs
// Hit this once to find your variant IDs, then add them to .env.local

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'PRINTFUL_API_KEY not set' }, { status: 500 });

  // Fetch all products from the Printful catalog
  const res = await fetch('https://api.printful.com/products', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: 'Printful error', detail: text }, { status: 500 });
  }

  const data = await res.json();
  const allProducts = data.result ?? [];

  // Filter to business card products
  const cardProducts = allProducts.filter((p: { type: string; title: string }) =>
    p.type?.toLowerCase().includes('business') ||
    p.title?.toLowerCase().includes('business card')
  );

  // If none found by filter, return all so user can browse
  const results = cardProducts.length > 0 ? cardProducts : allProducts;

  // For each product, fetch its variants
  const detailed = await Promise.all(
    results.slice(0, 10).map(async (p: { id: number; title: string; type: string }) => {
      const vRes = await fetch(`https://api.printful.com/products/${p.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const vData = await vRes.json();
      const variants = (vData.result?.variants ?? []).map((v: {
        id: number; name: string; retail_price: string;
      }) => ({
        variant_id:   v.id,
        name:         v.name,
        retail_price: v.retail_price,
      }));
      return { product_id: p.id, title: p.title, type: p.type, variants };
    })
  );

  return NextResponse.json({ products: detailed });
}
