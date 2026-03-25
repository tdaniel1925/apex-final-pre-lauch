/**
 * Simple test: Verify bio integration with VAPI prompt
 * Tests only the prompt generation, not full signup flow
 */

import { generateNetworkMarketingPrompt } from '../src/lib/vapi/prompts/network-marketing';

console.log('🧪 Testing VAPI Bio Personalization\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test data
const testBio = 'is a former teacher with 10 years of experience helping families protect what matters most. Passionate about financial education and empowering others to build wealth.';

// Test 1: Prompt WITHOUT bio
console.log('📝 Test 1: Generating prompt WITHOUT bio...\n');

const promptWithoutBio = generateNetworkMarketingPrompt({
  firstName: 'John',
  lastName: 'Smith',
  sponsorName: 'Apex Vision',
  replicatedSiteUrl: 'https://reachtheapex.net/johnsmith',
});

const hasGenericGreeting = promptWithoutBio.includes("Hi! You've reached John Smith's Apex business line. I'm their AI assistant");
console.log(`   Generic greeting present: ${hasGenericGreeting ? '✅ YES' : '❌ NO'}`);

if (hasGenericGreeting) {
  const greetingStart = promptWithoutBio.indexOf("Hi! You've reached");
  const greetingEnd = promptWithoutBio.indexOf('?', greetingStart) + 1;
  const greeting = promptWithoutBio.substring(greetingStart, greetingEnd);
  console.log(`   Greeting: "${greeting}"\n`);
} else {
  console.log('   ❌ Generic greeting not found!\n');
}

// Test 2: Prompt WITH bio
console.log('📝 Test 2: Generating prompt WITH bio...\n');

const promptWithBio = generateNetworkMarketingPrompt({
  firstName: 'John',
  lastName: 'Smith',
  sponsorName: 'Apex Vision',
  replicatedSiteUrl: 'https://reachtheapex.net/johnsmith',
  distributorBio: testBio,
});

// Check if bio is included
const hasBioInPrompt = promptWithBio.includes(testBio);
console.log(`   Bio included in prompt: ${hasBioInPrompt ? '✅ YES' : '❌ NO'}`);

// Check for personalized greeting
const hasPersonalizedGreeting = promptWithBio.includes('John is a former teacher');
console.log(`   Personalized greeting: ${hasPersonalizedGreeting ? '✅ YES' : '❌ NO'}`);

// Extract and display the ABOUT section
if (hasPersonalizedGreeting) {
  const greetingStart = promptWithBio.indexOf("Hi! You've reached");
  const greetingEnd = promptWithBio.indexOf('today?"', greetingStart) + 7;
  const greeting = promptWithBio.substring(greetingStart, greetingEnd);
  console.log(`\n   📢 Personalized Greeting:\n   "${greeting}"\n`);
}

// Extract ABOUT section
const aboutStart = promptWithBio.indexOf('## ABOUT JOHN');
if (aboutStart !== -1) {
  const nextSection = promptWithBio.indexOf('## YOUR IDENTITY', aboutStart);
  const aboutSection = promptWithBio.substring(aboutStart, nextSection);
  console.log('   📋 ABOUT Section:');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  aboutSection.split('\n').slice(0, 10).forEach(line => {
    console.log(`   ${line}`);
  });
  console.log('\n');
}

// Test 3: Verify key phrases are present
console.log('📝 Test 3: Verifying bio integration features...\n');

const checks = [
  {
    name: 'Bio in ABOUT section',
    test: () => promptWithBio.includes(testBio),
  },
  {
    name: 'Personalized introduction',
    test: () => promptWithBio.includes('John is a former teacher'),
  },
  {
    name: 'Background reference instruction',
    test: () => promptWithBio.includes("When talking about John, you can naturally reference their background") || promptWithBio.includes("Use John's Background"),
  },
  {
    name: 'Greeting includes bio snippet',
    test: () => promptWithBio.includes('John is a former teacher with 10 years of experience'),
  },
];

checks.forEach((check) => {
  const passed = check.test();
  console.log(`   ${passed ? '✅' : '❌'} ${check.name}`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const allPassed = checks.every((c) => c.test());
if (allPassed) {
  console.log('✅ ALL TESTS PASSED!\n');
  console.log('🎉 Bio personalization is working correctly!');
  console.log('   - Bios are included in VAPI prompts');
  console.log('   - Greetings are personalized');
  console.log('   - AI agents will reference distributor background\n');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
