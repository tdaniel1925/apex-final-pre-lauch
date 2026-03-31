const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'products', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

// Add import at the top (after other imports)
content = content.replace(
  "import Script from 'next/script';",
  "import Script from 'next/script';\nimport PulseProductCheckoutButton from '@/components/PulseProductCheckoutButton';"
);

// Replace PulseMarket button
content = content.replace(
  /<Link\s+href="\/get-started\?tier=pulsemarket"[\s\S]*?Get Started[\s\S]*?<\/Link>/,
  `<PulseProductCheckoutButton
                        productSlug="pulsemarket"
                        productName="PulseMarket"
                        price={79}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />`
);

// Replace PulseFlow button (the recommended one with larger styling)
content = content.replace(
  /<Link\s+href="\/get-started\?tier=pulseflow"[\s\S]*?Get Started[\s\S]*?<\/Link>/,
  `<PulseProductCheckoutButton
                        productSlug="pulseflow"
                        productName="PulseFlow"
                        price={149}
                        className="inline-block px-6 py-3 bg-[#2B4C7E] text-white rounded-lg text-sm font-bold shadow-lg hover:bg-[#1e3a5f] transition-all"
                      />`
);

// Replace PulseDrive button
content = content.replace(
  /<Link\s+href="\/get-started\?tier=pulsedrive"[\s\S]*?Get Started[\s\S]*?<\/Link>/,
  `<PulseProductCheckoutButton
                        productSlug="pulsedrive"
                        productName="PulseDrive"
                        price={299}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />`
);

// Replace PulseCommand button (Schedule Demo)
content = content.replace(
  /<Link\s+href="\/get-started\?tier=pulsecommand"[\s\S]*?Schedule Demo[\s\S]*?<\/Link>/,
  `<PulseProductCheckoutButton
                        productSlug="pulsecommand"
                        productName="PulseCommand"
                        price={499}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />`
);

// Write the updated content
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Products page updated with Stripe checkout buttons!');
