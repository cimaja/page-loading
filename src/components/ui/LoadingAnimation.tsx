'use client';

import React, { useEffect, useRef, useState } from 'react';

// Ladybug SVG Icon Component
const LadybugIcon = ({ className = "", onClick }: { className?: string; onClick?: () => void }) => (
  <svg
    className={`cursor-pointer hover:scale-110 transition-transform duration-200 ${className}`}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
  >
    {/* Ladybug body */}
    <ellipse cx="16" cy="18" rx="10" ry="8" fill="#e53e3e" />
    {/* Ladybug head */}
    <circle cx="16" cy="8" r="5" fill="#2d3748" />
    {/* Body split line */}
    <line x1="16" y1="10" x2="16" y2="26" stroke="#2d3748" strokeWidth="1.5" />
    {/* Spots */}
    <circle cx="12" cy="15" r="1.5" fill="#2d3748" />
    <circle cx="20" cy="15" r="1.5" fill="#2d3748" />
    <circle cx="13" cy="20" r="1.2" fill="#2d3748" />
    <circle cx="19" cy="20" r="1.2" fill="#2d3748" />
    {/* Eyes */}
    <circle cx="14" cy="7" r="1" fill="white" />
    <circle cx="18" cy="7" r="1" fill="white" />
    <circle cx="14" cy="7" r="0.5" fill="#2d3748" />
    <circle cx="18" cy="7" r="0.5" fill="#2d3748" />
    {/* Antennae */}
    <line x1="14" y1="4" x2="13" y2="2" stroke="#2d3748" strokeWidth="1" />
    <line x1="18" y1="4" x2="19" y2="2" stroke="#2d3748" strokeWidth="1" />
    <circle cx="13" cy="2" r="0.8" fill="#e53e3e" />
    <circle cx="19" cy="2" r="0.8" fill="#e53e3e" />
  </svg>
);

// Educational loading messages
const loadingMessages = [
  "Writing content and pages together...",
  "Breathing life into your app...",
  "Giving it that special shine...",
  "Crafting pixel-perfect layouts...",
  "Pro tip: Detailed prompts yield better results",
  "Did you know? You can request specific color schemes",
  "Building your digital masterpiece...",
  "Optimizing for your users' experience...",
  "Crafting your digital experience...",
  "Pro tip: Be specific in your prompts for better results",
  "Try describing your target audience for more relevant content",
  "Did you know? Our AI can generate multiple page layouts",
  "Analyzing your requirements...",
  "Selecting the perfect design elements...",
  "Fine-tuning every detail..."
];

// Cloud parameters interface
interface CloudParams {
  cloudSpeed: number;
  cloudIntensity: number;
  cloudComplexity: number;
  cloudContrast: number;
  cloudOpacity: number;
  isEnabled: boolean;
}

// Blob parameters interface
interface BlobConfig {
  id: string;
  name: string;
  color: string;
  speedMultiplier: number;
  size: number;
  blur: number;
  isEnabled: boolean;
}

interface BlobParams {
  blobs: BlobConfig[];
}

// WebGL Cloud Shader Component
const WebGLClouds = ({ 
  prefersReducedMotion, 
  cloudParams 
}: { 
  prefersReducedMotion: boolean;
  cloudParams: CloudParams;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef(Date.now());
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  // Extract cloud parameters from props
  const { cloudSpeed, cloudIntensity, cloudComplexity, cloudContrast, cloudOpacity } = cloudParams;

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS clouds');
      return;
    }

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;

    // Fragment shader source
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_speed;
      uniform float u_intensity;
      uniform float u_complexity;
      uniform float u_contrast;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
      }

      float fbm(vec2 st, float octaves) {
        float value = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 12; i++) {
          if (float(i) >= octaves) break;
          value += amp * noise(st);
          st *= 2.0;
          amp *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        float t = u_time * u_speed * 0.5;
        vec2 p = uv * 2.0 + vec2(t, t * 0.5);

        float n = fbm(p, u_complexity);
        float warp = fbm(uv * 0.75 + t * 0.2, min(u_complexity, 4.0)) * 0.25;
        n = fbm(p + warp, u_complexity);

        float density = clamp(n * u_intensity, 0.0, 1.0);
        float contrastPower = max(u_contrast * 0.8, 0.1);
        density = pow(smoothstep(0.2, 0.9, density), contrastPower);
        
        if (u_contrast > 2.0) {
          density = density * density;
        }

        vec3 gray = vec3(density);
        gl_FragColor = vec4(gray, density);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    
    if (!program) return;

    programRef.current = program;

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
    const complexityLocation = gl.getUniformLocation(program, 'u_complexity');
    const contrastLocation = gl.getUniformLocation(program, 'u_contrast');

    uniformsRef.current = {
      resolutionLocation,
      timeLocation,
      speedLocation,
      intensityLocation,
      complexityLocation,
      contrastLocation
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1, 1,   1, -1,   1, 1
    ]), gl.STATIC_DRAW);

    const resizeCanvas = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }
    };

    const animate = () => {
      resizeCanvas();
      
      const currentTime = (Date.now() - startTimeRef.current) * 0.001;
      
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(program);
      
      gl.uniform2f(uniformsRef.current.resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uniformsRef.current.timeLocation, currentTime);
      gl.uniform1f(uniformsRef.current.speedLocation, cloudSpeed);
      gl.uniform1f(uniformsRef.current.intensityLocation, cloudIntensity);
      gl.uniform1f(uniformsRef.current.complexityLocation, cloudComplexity);
      gl.uniform1f(uniformsRef.current.contrastLocation, cloudContrast);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (gl && programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, [prefersReducedMotion, cloudSpeed, cloudIntensity, cloudComplexity, cloudContrast]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 5,
        opacity: cloudOpacity
      }}
    />
  );
};

interface LoadingAnimationProps {
  className?: string;
}

// Types for animation elements
interface SparkConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  pulseIntensity: number;
}

export default function LoadingAnimation({ className = "" }: LoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [sparks, setSparks] = useState<SparkConfig[]>([]);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Cloud parameters state with default values
  const [cloudParams, setCloudParams] = useState<CloudParams>({
    cloudSpeed: 0.2,
    cloudIntensity: 1.2,
    cloudComplexity: 12.0,
    cloudContrast: 1.7,
    cloudOpacity: 0.6,
    isEnabled: true
  });

  // Blob parameters state with default values
  const [blobParams, setBlobParams] = useState<BlobParams>({
    blobs: [
      {
        id: 'purple',
        name: 'Purple Blob',
        color: '#8a2be2',
        speedMultiplier: 0.2,
        size: 600,
        blur: 80,
        isEnabled: true
      },
      {
        id: 'blue',
        name: 'Blue Blob',
        color: '#87ceeb',
        speedMultiplier: 1.25,
        size: 500,
        blur: 70,
        isEnabled: true
      },
      {
        id: 'yellow',
        name: 'Yellow Blob',
        color: '#ffd700',
        speedMultiplier: 1.5,
        size: 450,
        blur: 90,
        isEnabled: true
      },
      {
        id: 'pink',
        name: 'Pink Blob',
        color: '#dda0dd',
        speedMultiplier: 1.1,
        size: 550,
        blur: 75,
        isEnabled: true
      },
      {
        id: 'lavender',
        name: 'Lavender Blob',
        color: '#6a5acd',
        speedMultiplier: 0.2,
        size: 400,
        blur: 60,
        isEnabled: true
      },
      {
        id: 'orchid',
        name: 'Orchid Blob',
        color: '#ba55d3',
        speedMultiplier: 0.2,
        size: 480,
        blur: 85,
        isEnabled: true
      }
    ]
  });

  // Generate enhanced sparks
  const generateEnhancedSparks = (count = 15): SparkConfig[] => {
    const sparkColors: readonly string[] = ['#e8d5f2', '#f2e8f5', '#e8f0fe', '#f0e8ff', '#ffffff'] as const;
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.6,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 5,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
      pulseIntensity: 0.3 + Math.random() * 0.4
    }));
  };

  // Initialize random elements only on client to prevent hydration mismatch
  useEffect(() => {
    setIsClientMounted(true);
    setSparks(generateEnhancedSparks());
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Handle message rotation with delightful animations
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out animation
      setIsTransitioning(true);
      setIsVisible(false);
      
      setTimeout(() => {
        // Change message during invisible state
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        
        setTimeout(() => {
          // Start fade in animation
          setIsVisible(true);
          setIsTransitioning(false);
        }, 100);
      }, 800); // Wait for fade out to complete
      
    }, 6000); // 6 seconds per message

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      {/* Multi-layered Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient background */}
        <div 
          className={`absolute inset-0 ${
            prefersReducedMotion 
              ? 'bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100' 
              : 'bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50'
          }`}
        />

        {/* Dynamic Morphing Color Blobs */}
        {!prefersReducedMotion && blobParams.blobs.filter(blob => blob.isEnabled).map((blob, index) => {
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };

          const baseDuration = [20, 25, 30, 22, 28, 35][index] || 25;
          const animationDuration = baseDuration / blob.speedMultiplier;
          const animationName = `morphingBlob${index + 1}`;

          return (
            <div 
              key={blob.id}
              className="absolute"
              style={{
                width: `${blob.size}px`,
                height: `${blob.size}px`,
                background: `radial-gradient(circle, ${hexToRgba(blob.color, 0.5)} 0%, ${hexToRgba(blob.color, 0.25)} 50%, transparent 70%)`,
                borderRadius: '50%',
                filter: `blur(${blob.blur}px)`,
                animation: `${animationName} ${animationDuration}s ${index < 2 ? 'ease-in-out' : 'cubic-bezier(0.4, 0.0, 0.6, 1)'} infinite`,
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />
          );
        })}

        {/* Subtle overlay for depth */}
        {!prefersReducedMotion && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 30% 70%, rgba(216, 209, 242, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(252, 208, 213, 0.3) 0%, transparent 50%)',
              animation: 'breathingGlow 8s ease-in-out infinite alternate'
            }}
          />
        )}
      </div>

      {/* WebGL Shader Clouds Layer */}
      {cloudParams.isEnabled && (
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          <WebGLClouds prefersReducedMotion={prefersReducedMotion} cloudParams={cloudParams} />
        </div>
      )}



      {/* Enhanced Sparkling Effects */}
      {!prefersReducedMotion && isClientMounted && sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute"
          style={{
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            top: `${spark.y}%`,
            left: `${spark.x}%`,
            animation: `advancedSparkle ${spark.duration}s ease-in-out infinite ${spark.delay}s`
          }}
        >
          {/* Core spark */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: spark.color,
              opacity: spark.opacity,
              boxShadow: `0 0 ${spark.size * 2}px ${spark.color}, 0 0 ${spark.size * 4}px ${spark.color}40`,
              animation: `sparkleCore ${spark.duration * 0.7}s ease-in-out infinite ${spark.delay}s`
            }}
          />
          {/* Outer glow */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: spark.color,
              opacity: spark.opacity * 0.3,
              transform: `scale(${1.5 + spark.pulseIntensity})`,
              filter: 'blur(2px)',
              animation: `sparkleGlow ${spark.duration * 1.2}s ease-in-out infinite ${spark.delay}s`
            }}
          />
        </div>
      ))}

      {/* Ambient Light Particles */}
      {!prefersReducedMotion && isClientMounted && Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`ambient-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${20 + i * 5}px`,
            height: `${20 + i * 5}px`,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
            background: `radial-gradient(circle, ${['#e8d5f2', '#f2e8f5', '#e8f0fe'][i % 3]}20 0%, transparent 70%)`,
            filter: 'blur(10px)',
            opacity: 0.4,
            animation: `ambientFloat ${20 + i * 3}s ease-in-out infinite ${i * 2}s alternate`
          }}
        />
      ))}

      {/* Loading Text Content with Enhanced Animations */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-8">
          <div 
            className={`text-2xl font-semibold text-gray-700 transition-all duration-700 ease-out ${
              isVisible ? 'animate-textEnter' : 'animate-textExit'
            }`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? 'translateY(0px) scale(1)' 
                : isTransitioning 
                  ? 'translateY(-30px) scale(0.9)' 
                  : 'translateY(30px) scale(1.1)',
              textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
              animation: prefersReducedMotion ? undefined : 'gentleFloat 5s ease-in-out infinite'
            }}
            role="status" 
            aria-live="polite"
            aria-label="Loading status"
          >
            {loadingMessages[currentMessageIndex]}
          </div>
        </div>
      </div>

      {/* Ladybug Icon Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          <LadybugIcon />
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-40 transition-transform duration-300 ease-out ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Animation Settings</h2>
              <p className="text-sm text-gray-600">Customize loading animation parameters</p>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-md"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto space-y-6">

            {/* Cloud Controls Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Cloud Effects</h3>
                  <p className="text-sm text-gray-600">WebGL procedural cloud animation</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloudParams.isEnabled}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, isEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <button
                    onClick={() => setCloudParams({
                      cloudSpeed: 0.2, cloudIntensity: 1.2, cloudComplexity: 12.0,
                      cloudContrast: 1.7, cloudOpacity: 0.6, isEnabled: true
                    })}
                    className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
              
              <div className={`space-y-4 transition-opacity duration-200 ${cloudParams.isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={cloudParams.cloudSpeed}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, cloudSpeed: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cloudParams.isEnabled}
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-right">{cloudParams.cloudSpeed.toFixed(1)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensity
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={cloudParams.cloudIntensity}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, cloudIntensity: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cloudParams.isEnabled}
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-right">{cloudParams.cloudIntensity.toFixed(1)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexity
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="3.0"
                      max="20.0"
                      step="0.5"
                      value={cloudParams.cloudComplexity}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, cloudComplexity: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cloudParams.isEnabled}
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-right">{cloudParams.cloudComplexity.toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrast
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={cloudParams.cloudContrast}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, cloudContrast: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cloudParams.isEnabled}
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-right">{cloudParams.cloudContrast.toFixed(1)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={cloudParams.cloudOpacity}
                      onChange={(e) => setCloudParams(prev => ({ ...prev, cloudOpacity: parseFloat(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!cloudParams.isEnabled}
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-right">{Math.round(cloudParams.cloudOpacity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Blobs Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Gradient Blobs</h3>
                  <p className="text-sm text-gray-600">Background morphing animations</p>
                </div>
                <button
                  onClick={() => setBlobParams({
                    blobs: [
                      { id: 'purple', name: 'Purple Blob', color: '#8a2be2', speedMultiplier: 0.2, size: 600, blur: 80, isEnabled: true },
                      { id: 'blue', name: 'Blue Blob', color: '#87ceeb', speedMultiplier: 1.25, size: 500, blur: 70, isEnabled: true },
                      { id: 'yellow', name: 'Yellow Blob', color: '#ffd700', speedMultiplier: 1.5, size: 450, blur: 90, isEnabled: true },
                      { id: 'pink', name: 'Pink Blob', color: '#dda0dd', speedMultiplier: 1.1, size: 550, blur: 75, isEnabled: true },
                      { id: 'lavender', name: 'Lavender Blob', color: '#6a5acd', speedMultiplier: 0.2, size: 400, blur: 60, isEnabled: true },
                      { id: 'orchid', name: 'Orchid Blob', color: '#ba55d3', speedMultiplier: 0.2, size: 480, blur: 85, isEnabled: true }
                    ]
                  })}
                  className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-4">
                {blobParams.blobs.map((blob, index) => (
                  <div key={blob.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: blob.color }}
                        />
                        <h4 className="text-sm font-medium text-gray-900">{blob.name}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blob.isEnabled}
                          onChange={(e) => setBlobParams(prev => ({
                            blobs: prev.blobs.map(b => 
                              b.id === blob.id ? { ...b, isEnabled: e.target.checked } : b
                            )
                          }))}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className={`space-y-3 transition-opacity duration-200 ${blob.isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <input
                          type="color"
                          value={blob.color}
                          onChange={(e) => setBlobParams(prev => ({
                            blobs: prev.blobs.map(b => 
                              b.id === blob.id ? { ...b, color: e.target.value } : b
                            )
                          }))}
                          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                          disabled={!blob.isEnabled}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Speed</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0.2"
                            max="3.0"
                            step="0.1"
                            value={blob.speedMultiplier}
                            onChange={(e) => setBlobParams(prev => ({
                              blobs: prev.blobs.map(b => 
                                b.id === blob.id ? { ...b, speedMultiplier: parseFloat(e.target.value) } : b
                              )
                            }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            disabled={!blob.isEnabled}
                          />
                          <span className="text-sm font-mono text-gray-600 w-12 text-right">{blob.speedMultiplier.toFixed(1)}x</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="200"
                            max="800"
                            step="10"
                            value={blob.size}
                            onChange={(e) => setBlobParams(prev => ({
                              blobs: prev.blobs.map(b => 
                                b.id === blob.id ? { ...b, size: parseInt(e.target.value) } : b
                              )
                            }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            disabled={!blob.isEnabled}
                          />
                          <span className="text-sm font-mono text-gray-600 w-12 text-right">{blob.size}px</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blur</label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="20"
                            max="120"
                            step="5"
                            value={blob.blur}
                            onChange={(e) => setBlobParams(prev => ({
                              blobs: prev.blobs.map(b => 
                                b.id === blob.id ? { ...b, blur: parseInt(e.target.value) } : b
                              )
                            }))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            disabled={!blob.isEnabled}
                          />
                          <span className="text-sm font-mono text-gray-600 w-12 text-right">{blob.blur}px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with Copy Button */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                const configData = {
                  cloudSettings: {
                    speed: cloudParams.cloudSpeed,
                    intensity: cloudParams.cloudIntensity,
                    complexity: cloudParams.cloudComplexity,
                    contrast: cloudParams.cloudContrast,
                    opacity: cloudParams.cloudOpacity
                  },
                  gradientBlobs: blobParams.blobs.map(blob => ({
                    name: blob.name,
                    color: blob.color,
                    speedMultiplier: blob.speedMultiplier,
                    size: blob.size,
                    blur: blob.blur
                  })),
                  exportedAt: new Date().toISOString(),
                  source: 'Loading Animation Controls'
                };
                
                const configText = `Animation Configuration\n${'='.repeat(30)}\n\n` +
                  `📊 CLOUD SETTINGS:\n` +
                  `• Speed: ${cloudParams.cloudSpeed}\n` +
                  `• Intensity: ${cloudParams.cloudIntensity}\n` +
                  `• Complexity: ${cloudParams.cloudComplexity}\n` +
                  `• Contrast: ${cloudParams.cloudContrast}\n` +
                  `• Opacity: ${cloudParams.cloudOpacity}\n\n` +
                  `🌈 GRADIENT BLOBS:\n` +
                  blobParams.blobs.map(blob => 
                    `• ${blob.name}: ${blob.color} | Speed: ${blob.speedMultiplier}x | Size: ${blob.size}px | Blur: ${blob.blur}px`
                  ).join('\n') +
                  `\n\n📋 JSON Configuration:\n${JSON.stringify(configData, null, 2)}\n\n` +
                  `Exported: ${new Date().toLocaleString()}`;
                
                navigator.clipboard.writeText(configText).then(() => {
                  const button = event?.currentTarget as HTMLButtonElement;
                  if (button) {
                    const originalText = button.textContent;
                    button.textContent = '✓ Copied!';
                    button.classList.add('bg-green-600', 'text-white');
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.classList.remove('bg-green-600', 'text-white');
                    }, 2000);
                  }
                }).catch(() => {
                  console.log('Configuration data:', configText);
                  alert('Configuration copied to console (clipboard not available)');
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>Copy Configuration</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}