"use client";

import React, { useEffect, useRef } from "react";

export interface ParticleDriftProps {
  particleCount?: number;
  particleColor?: string;
  accentColor?: string;
  lineColor?: string;
  maxDistance?: number;
  speed?: number;
  mouseRadius?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
}

export default function ParticleDrift({
  particleCount = 80,
  particleColor = "#a8c7b5",
  accentColor = "#38b87c",
  lineColor = "rgba(56, 184, 124, 0.15)",
  maxDistance = 120,
  speed = 0.4,
  mouseRadius = 140,
  className = "",
}: ParticleDriftProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mousePos = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();

    // Resize observer for seamless responsiveness
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Pause when scrolled out of view to save battery/GPU
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    // Initialize particles
    const particles: Particle[] = [];
    const colors = [particleColor, particleColor, accentColor];

    for (let i = 0; i < particleCount; i++) {
      const rad = Math.random() * 1.5 + 1;
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        vx: (Math.random() - 0.5) * speed * (prefersReducedMotion ? 0.05 : 1),
        vy: (Math.random() - 0.5) * speed * (prefersReducedMotion ? 0.05 : 1),
        radius: rad,
        baseRadius: rad,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.3,
      });
    }

    // Pointer event handlers attached to container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.current.x = null;
      mousePos.current.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Render loop
    const render = () => {
      if (!isVisible) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Mouse interaction: tether & gentle attraction/glow
        let mouseDist = Infinity;
        if (mx !== null && my !== null) {
          const dx = mx - p.x;
          const dy = my - p.y;
          mouseDist = Math.sqrt(dx * dx + dy * dy);

          if (mouseDist < mouseRadius) {
            const force = (1 - mouseDist / mouseRadius) * 0.015;
            p.x += dx * force;
            p.y += dy * force;
            p.radius = p.baseRadius * (1 + (1 - mouseDist / mouseRadius) * 0.8);
          } else {
            p.radius = p.baseRadius;
          }
        } else {
          p.radius = p.baseRadius;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = mouseDist < mouseRadius ? 0.9 : p.alpha;
        ctx.fill();

        // Connect with mouse tether line
        if (mx !== null && my !== null && mouseDist < mouseRadius) {
          const tetherAlpha = (1 - mouseDist / mouseRadius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = accentColor;
          ctx.globalAlpha = tetherAlpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Connect with nearby neighbours
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    particleCount,
    particleColor,
    accentColor,
    lineColor,
    maxDistance,
    speed,
    mouseRadius,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
