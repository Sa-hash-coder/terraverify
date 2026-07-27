"use client";

import React, { useEffect, useRef, useState } from "react";

interface GlobeCanvasProps {
  selectedProject: number | null;
  onTransitionComplete: () => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export default function GlobeCanvas({ selectedProject, onTransitionComplete }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track angles and zoom scaling
  const [targetAngles, setTargetAngles] = useState({ x: 0, y: 0 });
  const currentAngles = useRef({ x: 0, y: 0 });
  const zoomScale = useRef(1.0);
  const isZooming = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  // Set target angles when the project changes
  useEffect(() => {
    isZooming.current = false;
    zoomScale.current = 1.0;

    if (selectedProject === 1) {
      // Amazon coordinates: Lat -3.42, Lon -62.40
      // Convert to spherical angles (in radians)
      setTargetAngles({
        x: -3.42 * (Math.PI / 180),
        y: 62.40 * (Math.PI / 180),
      });
    } else if (selectedProject === 2) {
      // Borneo coordinates: Lat -1.25, Lon 114.12
      setTargetAngles({
        x: -1.25 * (Math.PI / 180),
        y: -114.12 * (Math.PI / 180),
      });
    }
  }, [selectedProject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = (rect?.width || 800) * window.devicePixelRatio;
      canvas.height = (rect?.height || 500) * window.devicePixelRatio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Generate holographic points on a sphere (Fibonacci sphere distribution)
    const pointsCount = 450;
    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle in radians

    for (let i = 0; i < pointsCount; i++) {
      const y = 1 - (i / (pointsCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      points.push({ x, y, z });
    }

    let pulseTime = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const baseRadius = Math.min(width, height) * 0.28;

      pulseTime += 0.05;

      // Smoothly interpolate rotation angles towards the target coordinates
      currentAngles.current.x += (targetAngles.x - currentAngles.current.x) * 0.06;
      currentAngles.current.y += (targetAngles.y - currentAngles.current.y) * 0.06;

      const rx = currentAngles.current.x;
      const ry = currentAngles.current.y;

      // Detect if we are close to the target coordinates to trigger the zoom transition
      const dx = Math.abs(targetAngles.x - currentAngles.current.x);
      const dy = Math.abs(targetAngles.y - currentAngles.current.y);

      if (dx < 0.02 && dy < 0.02) {
        isZooming.current = true;
      }

      if (isZooming.current) {
        // Zoom in exponentially (hologram scales up)
        zoomScale.current += (10.0 - zoomScale.current) * 0.05;
        if (zoomScale.current > 4.5) {
          // Trigger the transition to the 2D map once we zoom past the screen threshold
          onTransitionComplete();
        }
      }

      const currentRadius = baseRadius * zoomScale.current;

      // Sort points by depth (Z-axis) so we render background points first (painters algorithm)
      const projectedPoints = points.map((p) => {
        // Rotate around Y axis (longitude)
        const x1 = p.x * Math.cos(ry) - p.z * Math.sin(ry);
        const z1 = p.x * Math.sin(ry) + p.z * Math.cos(ry);

        // Rotate around X axis (latitude)
        const y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = p.y * Math.sin(rx) + z1 * Math.cos(rx);

        return {
          x: x1 * currentRadius + width / 2,
          y: y2 * currentRadius + height / 2,
          z: z2,
        };
      });

      projectedPoints.sort((a, b) => a.z - b.z);

      // Render the points
      projectedPoints.forEach((p) => {
        const dotSize = Math.max(1, (p.z + 1.2) * 2.5 * Math.min(zoomScale.current, 1.5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize, 0, 2 * Math.PI);

        // Make points on the front of the sphere bright emerald green, and back points faded
        if (p.z > 0) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + p.z * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + (p.z + 1) * 0.1})`;
        }
        ctx.fill();
      });

      // Target Coordinate Marker (Amazon / Borneo)
      // Since our rotation angles are designed to center the target coordinate at the front-center,
      // the targeted position is mathematically at (x=0, y=0, z=1) in rotated space.
      const targetX = width / 2;
      const targetY = height / 2;

      // Render high-tech radar targeting crosshairs and sweep
      if (!isZooming.current) {
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
        ctx.lineWidth = 1;

        // Outer scanning ring
        ctx.beginPath();
        ctx.arc(targetX, targetY, 40, 0, 2 * Math.PI);
        ctx.stroke();

        // Pulsing radar ping
        const pulseRadius = 15 + Math.abs(Math.sin(pulseTime)) * 25;
        ctx.strokeStyle = `rgba(16, 185, 129, ${1 - (pulseRadius - 15) / 25})`;
        ctx.beginPath();
        ctx.arc(targetX, targetY, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = "rgba(16, 185, 129, 0.7)";
        ctx.beginPath();
        ctx.moveTo(targetX - 25, targetY);
        ctx.lineTo(targetX - 10, targetY);
        ctx.moveTo(targetX + 10, targetY);
        ctx.lineTo(targetX + 25, targetY);
        ctx.moveTo(targetX, targetY - 25);
        ctx.lineTo(targetX, targetY - 10);
        ctx.moveTo(targetX, targetY + 10);
        ctx.lineTo(targetX, targetY + 25);
        ctx.stroke();

        // Coordinate text readout
        ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        const lat = selectedProject === 1 ? "-3.42" : "-1.25";
        const lon = selectedProject === 1 ? "-62.40" : "114.12";
        ctx.fillText(`TARGET LOCKED: LAT ${lat} LON ${lon}`, targetX, targetY - 50);
      } else {
        // Fast scaling sweep lines for the warp-speed zoom effect
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - zoomScale.current / 4)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 15 * zoomScale.current, 0, 2 * Math.PI);
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [targetAngles, selectedProject, onTransitionComplete]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#05080c] relative overflow-hidden flex items-center justify-center">
      {/* Target Status HUD */}
      <div className="absolute top-6 left-6 z-10 font-mono text-xs text-emerald-400 space-y-1 bg-black/60 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ORBITAL TELESCOPE: SENTINEL-2 L2A</span>
        </div>
        <div>STATUS: ACQUIRING TARGET...</div>
        <div>ZOOM LEVEL: {(zoomScale.current * 100).toFixed(0)}%</div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
