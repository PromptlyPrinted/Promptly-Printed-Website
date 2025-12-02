# Geoapify Address Autocomplete Setup

## Overview

The address autocomplete has been migrated from Google Maps to **Geoapify** - a free alternative with a generous free tier.

## Why Geoapify?

- ✅ **3,000 requests/day FREE** (no credit card required)
- ✅ Excellent address quality and international coverage
- ✅ Simple REST API (no external scripts to load)
- ✅ Easy to implement and maintain
- ✅ Can upgrade to paid plan if needed (much cheaper than Google)

## Getting Your Free API Key

1. **Sign up for Geoapify**:
   - Go to [https://www.geoapify.com/](https://www.geoapify.com/)
   - Click "Get Started Free"
   - Sign up with email (no credit card required)

2. **Get Your API Key**:
   - After signup, you'll be taken to your dashboard
   - Your API key will be displayed immediately
   - Copy the API key

3. **Add to Environment Variables**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_GEOAPIFY_API_KEY=your_api_key_here
   ```

4. **Restart Your Dev Server**:
   ```bash
   npm run dev
   ```

## Usage

The `AddressAutocomplete` component works the same way as before:

```tsx
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

<AddressAutocomplete
  onAddressSelect={(address) => {
    console.log('Selected address:', address);
    // address contains: addressLine1, addressLine2, city, state, postalCode, country
  }}
  placeholder="Start typing your address..."
  countryCode="GB" // Optional: restrict to specific country
  language="en"    // Optional: set language
/>
```

## Features

- **Debounced Search**: Waits 300ms after typing before searching
- **Minimum 3 Characters**: Prevents unnecessary API calls
- **Dropdown Suggestions**: Shows up to 5 address suggestions
- **Click Outside to Close**: Suggestions close when clicking elsewhere
- **Country Filtering**: Optional country restriction
- **Language Support**: Customize result language
- **Fallback**: Shows manual input if API key not configured

## Free Tier Limits

- **3,000 requests/day** = ~90,000 requests/month
- **No credit card required**
- **No expiration**

For most small-medium businesses, this is more than enough!

## Pricing (if you need more)

If you exceed the free tier:
- **Freelancer**: $49/month for 100,000 requests
- **Startup**: $99/month for 300,000 requests
- **Business**: $249/month for 1,000,000 requests

Still much cheaper than Google Maps! 💰

## API Response Format

Geoapify returns structured address data:

```json
{
  "properties": {
    "formatted": "10 Downing Street, London SW1A 2AA, United Kingdom",
    "housenumber": "10",
    "street": "Downing Street",
    "city": "London",
    "postcode": "SW1A 2AA",
    "country_code": "gb",
    "state": "England"
  }
}
```

## Monitoring Usage

1. Log into your Geoapify dashboard
2. View "Statistics" to see daily/monthly usage
3. Set up email alerts for usage thresholds

## Troubleshooting

### No suggestions appearing?
- Check that `NEXT_PUBLIC_GEOAPIFY_API_KEY` is set in `.env.local`
- Restart your dev server after adding the key
- Check browser console for errors
- Verify API key is valid in Geoapify dashboard

### "API key not configured" message?
- Make sure the env variable starts with `NEXT_PUBLIC_` (required for client-side)
- Restart dev server after adding the key

### Rate limit errors?
- Free tier: 3,000 requests/day
- Check usage in Geoapify dashboard
- Consider upgrading if needed

## Migration from Google Maps

The component interface remains the same, so no changes needed in parent components. The only change is the environment variable:

**Before:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

**After:**
```bash
NEXT_PUBLIC_GEOAPIFY_API_KEY=...
```

## Additional Resources

- [Geoapify Documentation](https://www.geoapify.com/geocoding-api)
- [Autocomplete API Docs](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/)
- [Dashboard](https://myprojects.geoapify.com/)
