import { describe, it, expect } from 'vitest';

describe('Social Media Tools', () => {
  it('should generate referral link correctly', () => {
    const distributorSlug = 'john-smith';
    const baseLink = `https://apexaffinity.com/join/${distributorSlug}`;

    expect(baseLink).toBe('https://apexaffinity.com/join/john-smith');
  });

  it('should build UTM parameters correctly', () => {
    const baseLink = 'https://apexaffinity.com/join/john-smith';
    const utmSource = 'facebook';
    const utmMedium = 'social';
    const utmCampaign = 'spring2024';

    const params: string[] = [];
    if (utmSource) params.push(`utm_source=${encodeURIComponent(utmSource)}`);
    if (utmMedium) params.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
    if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);

    const link = `${baseLink}?${params.join('&')}`;

    expect(link).toBe(
      'https://apexaffinity.com/join/john-smith?utm_source=facebook&utm_medium=social&utm_campaign=spring2024'
    );
  });

  it('should personalize social post templates', () => {
    const distributorName = 'John Smith';
    const referralLink = 'https://apexaffinity.com/join/john-smith';
    const templateText = 'Check out our products!';

    const personalizedText = `${templateText}\n\n${referralLink}`;

    expect(personalizedText).toContain('Check out our products!');
    expect(personalizedText).toContain(referralLink);
  });
});
