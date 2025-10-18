# About Page Videos

This directory contains videos and thumbnails for the About page.

## File Structure

```
/public/videos/about/
├── README.md (this file)
├── about-video.mp4          <- Your main about video goes here
├── about-video.webm         <- (Optional) WebM format for better browser support
└── thumbnails/
    └── about-poster.jpg     <- Video thumbnail/poster image
```

## Adding Your Video

1. **Add your main video:**
   - Place your video file here as: `about-video.mp4`
   - Recommended format: MP4 (H.264 codec)
   - Recommended resolution: 1920x1080 (Full HD) or 1280x720 (HD)
   - Recommended aspect ratio: 16:9

2. **Add a poster/thumbnail image:**
   - Place a thumbnail in: `thumbnails/about-poster.jpg`
   - This shows before the video loads
   - Same aspect ratio as video (16:9)
   - Recommended size: 1920x1080px

3. **Optional WebM version:**
   - Add `about-video.webm` for better compression and browser support
   - The page will automatically use the best format for each browser

## Video Best Practices

- **File size:** Keep under 50MB for faster loading
- **Duration:** 1-3 minutes is ideal for About pages
- **Content ideas:**
  - Behind-the-scenes footage
  - Product showcase
  - Team introduction
  - Customer testimonials
  - Process demonstration

## Browser Support

The video player supports:
- MP4 (all modern browsers)
- WebM (Chrome, Firefox, Opera, Edge)
- The page provides fallback text for older browsers
