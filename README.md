# Next.js Ambient Loading Animation

A premium loading experience featuring procedural WebGL clouds over morphing lavender-pink gradient backgrounds with elegant educational text transitions.

## 🎨 Features

- ✅ **Advanced WebGL Shaders**: Procedural cloud generation using Fractional Brownian Motion
- ✅ **Morphing Color Blobs**: Six independent animated gradients with smooth transitions
- ✅ **3D Text Animation**: Professional depth-based text transitions with perspective transforms
- ✅ **Performance Optimized**: Hardware-accelerated animations with 60fps targeting
- ✅ **Accessibility**: Full `prefers-reduced-motion` support with CSS fallbacks
- ✅ **SSR Safe**: Hydration-safe implementation for production deployment
- ✅ **TypeScript**: Full type safety with strict mode enabled
- ✅ **Error Boundaries**: Production-ready error handling
- ✅ **Security**: Security headers and production optimizations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/cimaja/page-loading.git
cd page-loading

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the ambient loading animation.

## 🛠️ Development

### Available Scripts

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Project Structure

```
src/
├── app/
│   ├── globals.css          # Animation keyframes and base styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page with LoadingAnimation
└── components/
    ├── ErrorBoundary.tsx    # Production error handling
    └── ui/
        └── LoadingAnimation.tsx  # Main animation component
```

## 🎯 Technical Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Runtime**: React 19.1.0 
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS v4
- **Graphics**: Raw WebGL (no libraries)
- **Build Tool**: Turbopack

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

*WebGL fallback to CSS animations for unsupported browsers*

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect to Vercel
npx vercel

# Deploy
npx vercel --prod
```

### Other Platforms

The app builds to a standard Next.js production bundle compatible with:
- Netlify
- Railway 
- AWS Amplify
- Docker containers

## ⚡ Performance

- **Bundle Size**: 117KB first load JS (optimized)
- **First Load**: <100ms to interactive
- **Animation Performance**: 60fps with hardware acceleration
- **WebGL Fallback**: Graceful degradation to CSS
- **Error Boundaries**: Production-safe error handling
- **Security Headers**: CSP and security optimizations

## 🔧 Customization

### Modify Colors
Edit the blob gradients in `LoadingAnimation.tsx`:

```tsx
background: 'radial-gradient(circle, rgba(138, 43, 226, 0.55) 0%, ...)'
```

### Adjust Animation Speed
Modify keyframe durations in `globals.css`:

```css
animation: 'morphingBlob1 20s cubic-bezier(0.4, 0.0, 0.6, 1) infinite'
```

### Change Loading Messages
Update the `loadingMessages` array in `LoadingAnimation.tsx`.
