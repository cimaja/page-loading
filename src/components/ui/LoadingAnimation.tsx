'use client';

import React, { useEffect, useRef, useState } from 'react';

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

// WebGL Cloud Shader Component
const WebGLClouds = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef(Date.now());
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  // Fixed cloud parameters - adjusted for better color visibility
  const cloudSpeed = 0.6;
  const cloudIntensity = 1.2;
  const cloudComplexity = 12.0;
  const cloudContrast = 1.7;
  const cloudOpacity = 0.8;

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

        {/* Morphing color blobs */}
        {!prefersReducedMotion && (
          <>
            {/* Purple blob */}
            <div 
              className="absolute"
              style={{
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(138, 43, 226, 0.55) 0%, rgba(138, 43, 226, 0.3) 40%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                animation: 'morphingBlob1 20s ease-in-out infinite',
                transformOrigin: 'center'
              }}
            />

            {/* Blue blob */}
            <div 
              className="absolute"
              style={{
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(135, 206, 235, 0.5) 0%, rgba(135, 206, 235, 0.25) 50%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(70px)',
                animation: 'morphingBlob2 25s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />

            {/* Yellow blob */}
            <div 
              className="absolute"
              style={{
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.45) 0%, rgba(255, 215, 0, 0.2) 60%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(90px)',
                animation: 'morphingBlob3 30s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />

            {/* Pink blob */}
            <div 
              className="absolute"
              style={{
                width: '550px',
                height: '550px',
                background: 'radial-gradient(circle, rgba(221, 160, 221, 0.5) 0%, rgba(221, 160, 221, 0.3) 45%, transparent 75%)',
                borderRadius: '50%',
                filter: 'blur(75px)',
                animation: 'morphingBlob4 22s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />

            {/* Lavender blob */}
            <div 
              className="absolute"
              style={{
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(106, 90, 205, 0.45) 0%, rgba(106, 90, 205, 0.25) 55%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'morphingBlob5 28s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />

            {/* Orchid blob */}
            <div 
              className="absolute"
              style={{
                width: '480px',
                height: '480px',
                background: 'radial-gradient(circle, rgba(186, 85, 211, 0.47) 0%, rgba(186, 85, 211, 0.28) 50%, transparent 75%)',
                borderRadius: '50%',
                filter: 'blur(85px)',
                animation: 'morphingBlob6 35s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
                transformOrigin: 'center',
                willChange: 'transform, opacity'
              }}
            />
          </>
        )}

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
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        <WebGLClouds prefersReducedMotion={prefersReducedMotion} />
      </div>



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
    </div>
  );
}