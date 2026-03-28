# Rep Back Office - End-to-End Test Suite

Comprehensive Playwright test suite for the entire distributor/rep back office system.

## Test Coverage

### 01 - Authentication (`01-auth.spec.ts`)
- ✅ Login page display
- ✅ Form validation
- ✅ Email format validation
- ⚠️ Error messages for invalid credentials
- ⚠️ Successful login flow (requires test user)
- ✅ Forgot password link
- ✅ Protected route redirection

### 02 - Dashboard (`02-dashboard.spec.ts`)
- Dashboard page layout
- Welcome message and user info
- Stats and metrics cards
- Navigation menu functionality
- Rank information display
- Quick action buttons
- Team/downline information
- Profile/settings access
- Logout functionality
- Console error checking

### 03 - AI Autopilot Invitations (`03-autopilot-invitations.spec.ts`)
- Invitations page display
- Invitation form rendering
- Invitation type selector (company event vs custom)
- Company events dropdown loading
- Email validation
- AI-generated message preview
- Send invitation button
- Usage limit display
- Form completion and submission
- Success messages
- Subscription upgrade links

### 04 - Autopilot Features (`04-autopilot-features.spec.ts`)

**Flyers:**
- Page display
- Template/creation options
- Download/generate functionality

**Social Media:**
- Page display
- Post templates and content
- Copy/share functionality

**CRM Contacts:**
- Contacts page display
- Contact list or add form
- Add contact functionality

**Subscription:**
- Subscription page
- Tier information
- Usage limits
- Upgrade options

**Team Features:**
- Broadcasts page and functionality
- Team training resources
- Team activity feed

### 05 - Genealogy & Team (`05-genealogy-team.spec.ts`)

**Genealogy:**
- Page display
- Tree/organization structure
- Distributor information
- Search/filter functionality
- Team stats
- Expandable/collapsible nodes
- Rank information for team members

**Matrix View:**
- Matrix page display
- Matrix structure visualization
- Position display
- Available vs filled positions
- Detail view for team members

**Team Management:**
- Team page display
- Members list/overview
- Team statistics
- Direct recruits display
- Activity/performance metrics
- Team member details

**Compensation Views:**
- Compensation overview
- Commission information
- Rank bonuses
- Compensation calculator

### 06 - Training & Resources (`06-training-resources.spec.ts`)

**Training Overview:**
- Training page display
- Modules/categories
- Navigation to sections

**Training Videos:**
- Videos page display
- Video player/list
- Categories/playlists
- Video titles and descriptions
- Playback controls
- Progress tracking
- Video selection and playback

**Resources:**
- Resources section
- Downloadable materials
- Resource categorization

**Business Tools:**
- Business card designer access
- Marketing materials

**Live Events:**
- Live events links
- Upcoming events display

**Progress Tracking:**
- Training progress
- Certifications/badges

### 07 - Profile & Settings (`07-profile-settings.spec.ts`)

**Profile Management:**
- Profile page display
- User information fields (name, email, phone)
- Profile photo/avatar
- Edit profile functionality
- Save/update buttons
- Distributor ID display
- Rank information
- Join date

**Settings:**
- Settings page display
- Notification preferences
- Toggle switches for notifications
- Password change option
- Communication preferences
- Privacy settings
- Save settings functionality

**Account Security:**
- Password change form
- Current password requirement

**Replicated Site:**
- Site URL display
- Customization options

**Payment Information:**
- Payment/banking section
- Tax information

## Test User Requirements

To run these tests successfully, you need a test distributor account:

```
Email: test.distributor@apex.com
Password: TestPassword123!
```

Create this user in Supabase if it doesn't exist yet.

## Running the Tests

```bash
# Run all rep back office tests
npm run test:e2e -- tests/e2e/rep-backoffice

# Run specific test file
npm run test:e2e -- tests/e2e/rep-backoffice/01-auth.spec.ts

# Run with UI
npm run test:e2e:ui -- tests/e2e/rep-backoffice

# Run in headed mode
npm run test:e2e -- tests/e2e/rep-backoffice --headed
```

## Test Strategy

The tests use:
- **Flexible selectors**: Tests look for elements using multiple strategies (text, role, class, etc.)
- **Conditional checks**: Many tests check if elements exist before asserting, allowing for optional features
- **Timeout handling**: Generous timeouts for async operations
- **Error resilience**: Tests continue even if some optional features aren't present

## Known Issues & Limitations

1. **Test User Dependency**: Many tests require a valid test distributor account in the database
2. **Authentication**: Tests that require login will skip if the test user doesn't exist
3. **Optional Features**: Some tests are designed to pass even if features aren't implemented yet
4. **Console Errors**: Browser extension errors are filtered out from console error checks

## Fixing Broken Tests

When tests fail:

1. Check the error message for the specific assertion that failed
2. Use headed mode (`--headed`) to see what's happening in the browser
3. Add debug screenshots: `await page.screenshot({ path: 'debug.png' })`
4. Check browser console: `page.on('console', msg => console.log(msg.text()))`
5. Verify the test user exists in the database
6. Confirm the page route matches the expected URL pattern

## Test Output

Test results are saved to:
- HTML Report: `playwright-report/index.html`
- Screenshots (on failure): `test-results/`
- Traces (on retry): `test-results/`

Open the HTML report:
```bash
npx playwright show-report
```
