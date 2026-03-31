# Facebook Posts Implementation Flow

## Component Initialization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Component Mounts (ProductsPage)                              │
│    - Load React hooks (useState, useEffect, useMemo)            │
│    - Initialize state variables                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Randomization (useMemo)                                      │
│    - Run Fisher-Yates shuffle on examples.social array         │
│    - Store in randomizedSocialPosts                            │
│    - Only runs ONCE on mount (memoized)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Facebook SDK Load (useEffect)                                │
│    - Check if window.FB exists                                  │
│    - If not, inject Facebook SDK script                        │
│    - Set fbAsyncInit callback                                  │
│    - Update facebookSDKLoaded state when ready                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Render Page                                                  │
│    - Display navigation, hero, tabs                            │
│    - Show comparison table                                      │
│    - Render example cards based on activeTab                   │
│    - Use randomizedSocialPosts for social tab                  │
└─────────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER: Clicks "📱 Social Media" tab                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM: Updates activeTab state to 'social'                     │
│         Shows 6 randomized Facebook post cards                  │
│         Each card shows:                                        │
│         - Thumbnail image from pics-for-scial                  │
│         - Blue "FACEBOOK POST" badge                           │
│         - Title, industry, description                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USER: Clicks on a Facebook post card                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM: Updates selectedExample state                           │
│         Opens modal with dark overlay                           │
│         Renders fb-post component with data-href attribute      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FACEBOOK SDK: Detects fb-post element (useEffect triggers)      │
│               Calls FB.XFBML.parse() after 100ms delay         │
│               Fetches post data from Facebook API              │
│               Renders full post embed with:                     │
│               - Post content & media                           │
│               - Like/Share buttons                             │
│               - Comments (if available)                        │
│               - Engagement metrics                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ USER: Can interact with:                                        │
│       - "View on Facebook" button (opens in new tab)           │
│       - X close button (top-right)                             │
│       - Click outside modal (closes)                            │
│       - Scroll within modal for long posts                      │
└─────────────────────────────────────────────────────────────────┘
```

## Fisher-Yates Shuffle Algorithm

```
Input: [fb1, fb2, fb3, fb4, fb5, fb6]

Step 1: i=5, j=random(0-5) e.g. j=2
        Swap fb6 ↔ fb3
        [fb1, fb2, fb6, fb4, fb5, fb3]

Step 2: i=4, j=random(0-4) e.g. j=1
        Swap fb5 ↔ fb2
        [fb1, fb5, fb6, fb4, fb2, fb3]

Step 3: i=3, j=random(0-3) e.g. j=0
        Swap fb4 ↔ fb1
        [fb4, fb5, fb6, fb1, fb2, fb3]

Step 4: i=2, j=random(0-2) e.g. j=2
        Swap fb6 ↔ fb6 (no change)
        [fb4, fb5, fb6, fb1, fb2, fb3]

Step 5: i=1, j=random(0-1) e.g. j=0
        Swap fb5 ↔ fb4
        [fb5, fb4, fb6, fb1, fb2, fb3]

Output: [fb5, fb4, fb6, fb1, fb2, fb3] ← Randomized!
```

## Data Structure

```typescript
interface Example {
  id: string;              // 'fb1' - 'fb6'
  title: string;           // 'Apex Facebook Post 1'
  industry: string;        // 'Apex Social Media'
  thumbnail: string;       // '/pics-for-scial/[filename].jpg'
  description: string;     // Post description
  facebookUrl?: string;    // Facebook share URL
}

// Examples in memory
examples.social = [
  {
    id: 'fb1',
    title: 'Apex Facebook Post 1',
    industry: 'Apex Social Media',
    thumbnail: '/pics-for-scial/649495926_122185202720779588_7715371351485288963_n.jpg',
    description: 'Engaging social media post from Apex Affinity Group',
    facebookUrl: 'https://www.facebook.com/share/r/1L4DJbN4tw/',
  },
  // ... fb2 through fb6
]

// After randomization (example)
randomizedSocialPosts = [fb3, fb1, fb5, fb2, fb6, fb4]
```

## Facebook Embed Structure

```html
<!-- Container -->
<div id="fb-root"></div>

<!-- Facebook Post Embed -->
<div class="fb-post"
     data-href="https://www.facebook.com/share/r/1L4DJbN4tw/"
     data-width="550"
     data-show-text="true">

  <!-- Fallback while loading -->
  <blockquote cite="https://www.facebook.com/share/r/1L4DJbN4tw/"
              class="fb-xfbml-parse-ignore">
    <p>Loading Facebook post...</p>
    <a href="https://www.facebook.com/share/r/1L4DJbN4tw/">View on Facebook</a>
  </blockquote>
</div>

<!-- Facebook SDK Script -->
<script async defer crossorigin="anonymous"
        src="https://connect.facebook.net/en_US/sdk.js">
</script>
```

## State Management

```typescript
// Component State
const [activeTab, setActiveTab] = useState<ContentType>('landing');
  // Current tab: 'landing' | 'social' | 'email' | 'video' | 'podcast'

const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  // Currently selected example for modal display

const [facebookSDKLoaded, setFacebookSDKLoaded] = useState(false);
  // Tracks if Facebook SDK is ready

// Memoized Data
const randomizedSocialPosts = useMemo(() => shuffleArray(examples.social), []);
  // Shuffled once, persists for component lifetime

// Computed Data
const currentExamples = activeTab === 'social'
  ? randomizedSocialPosts
  : examples[activeTab];
  // Use randomized version for social tab, original for others
```

## File Structure

```
C:\dev\1 - Apex Pre-Launch Site\
├── src/
│   └── app/
│       └── products/
│           └── page.tsx ← Main implementation
├── public/
│   └── pics-for-scial/ ← Image assets
│       ├── 649495926_122185202720779588_7715371351485288963_n.jpg
│       ├── 649972946_122185443908779588_2200617253231723518_n.jpg
│       ├── 652081085_122118942897187889_5521415253285923450_n.jpg
│       └── 653701701_122120269731187889_8133003492452843743_n.jpg
├── FACEBOOK_POSTS_IMPLEMENTATION.md ← Documentation
└── FACEBOOK_POSTS_FLOW.md ← This file
```

## Key Features Summary

✅ **6 Facebook Posts** - All URLs integrated with thumbnails
✅ **Randomization** - Fisher-Yates shuffle on page load
✅ **Modal Display** - Full-resolution Facebook embeds
✅ **Facebook SDK** - Auto-loaded and parsed
✅ **Responsive Design** - Mobile-friendly cards and modal
✅ **Visual Indicators** - Blue Facebook badge on cards
✅ **CTA Button** - "View on Facebook" direct link
✅ **Accessibility** - Keyboard nav, semantic HTML, ARIA
✅ **Performance** - Memoized shuffle, lazy SDK load
✅ **Error Handling** - Fallback message while loading
