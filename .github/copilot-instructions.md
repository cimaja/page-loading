# Next.js Ambient Loading Animation Project

This project creates a premium loading experience with procedural WebGL clouds over a morphing lavender-pink gradient background with elegant upward-sliding educational text.

## Project Features Implemented ✅
- ✅ Next.js 15+ with app router
- ✅ TypeScript with strict type checking
- ✅ Tailwind CSS v4 with custom animations
- ✅ WebGL procedural cloud shader (raw WebGL, no three.js library usage)
- ✅ Animated gradient background (#D8D1F2 lavender and #FCD0D5 pink)
- ✅ 15 educational loading messages with upward slide transitions (6s rotation)
- ✅ CSS fallback clouds and sparkle effects for browsers without WebGL
- ✅ Full accessibility support with prefers-reduced-motion
- ✅ Fractional Brownian Motion (FBM) noise in fragment shader
- ✅ Cloud parameters: speed 0.6, intensity 0.8, complexity 12.0, contrast 1.7, opacity 0.5
- ✅ Enhanced gradient saturation and brightness filters
- ✅ Server-side rendering safe implementation

## Development Guidelines
- Use TypeScript strict mode
- Handle server-side rendering safely
- Implement proper WebGL context checking
- Include comprehensive CSS fallbacks
- Focus on performance and accessibility

## Running the Project
```bash
npm run dev
```
Then open http://localhost:3000 to see the ambient loading animation.