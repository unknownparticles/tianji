
/**
 * 电影级水墨风太极八卦动画
 * 「太极生两仪，两仪生四象，四象生八卦」
 *
 * 技术栈：SVG + Canvas + GSAP Timeline
 * 风格：中国水墨、新中式、东方玄学
 * 配色：黑、白、水墨灰、少量金色光晕
 */

import React, { useEffect, useRef, useCallback } from 'react';

interface CinematicTaijiProps {
  onComplete: () => void;
  autoPlay?: boolean;
}

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger?: any;
  }
}

const CinematicTaiji: React.FC<CinematicTaijiProps> = ({ onComplete, autoPlay = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<any>(null);
  const animationRef = useRef<{
    particles: Particle[];
    inkDrops: InkDrop[];
    vortex: VortexParticle[];
  }>({ particles: [], inkDrops: [], vortex: [] });

  // 粒子类
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
    canvas: HTMLCanvasElement;
  }

  interface InkDrop {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    size: number;
    progress: number;
    opacity: number;
    spread: number;
    canvas: HTMLCanvasElement;
  }

  interface VortexParticle {
    angle: number;
    radius: number;
    speed: number;
    size: number;
    opacity: number;
    canvas: HTMLCanvasElement;
  }

  // 绘制水墨粒子
  const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.globalAlpha = p.opacity * 0.5;

    // 水墨渐变
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, 'rgba(60, 60, 60, 1)');
    gradient.addColorStop(0.5, 'rgba(40, 40, 40, 0.5)');
    gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };

  // 绘制墨滴
  const drawInkDrop = (drop: InkDrop, ctx: CanvasRenderingContext2D) => {
    if (drop.progress <= 0 || drop.progress >= 1) return;

    const scale = Math.sin(drop.progress * Math.PI);
    const wobble = Math.sin(drop.progress * Math.PI * 3) * drop.spread * 0.3;

    ctx.save();
    ctx.globalAlpha = (1 - drop.progress) * 0.6;

    // 墨迹边缘不规则效果
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = drop.size * scale + Math.sin(angle * 3 + drop.progress * 10) * drop.spread;
      const x = drop.x + Math.cos(angle) * r + wobble;
      const y = drop.y + Math.sin(angle) * r + wobble;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, drop.size * scale + drop.spread);
    gradient.addColorStop(0, 'rgba(15, 15, 15, 0.8)');
    gradient.addColorStop(0.7, 'rgba(30, 30, 30, 0.4)');
    gradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  };

  // 绘制漩涡粒子
  const drawVortex = (v: VortexParticle, ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const x = centerX + Math.cos(v.angle) * v.radius;
    const y = centerY + Math.sin(v.angle) * v.radius;

    ctx.save();
    ctx.globalAlpha = v.opacity * 0.4;

    // 墨迹拖尾
    ctx.beginPath();
    ctx.moveTo(x, y);
    const tailLength = v.speed * 5;
    const prevX = centerX + Math.cos(v.angle - 0.2) * (v.radius - v.speed);
    const prevY = centerY + Math.sin(v.angle - 0.2) * (v.radius - v.speed);

    ctx.quadraticCurveTo(
      (x + prevX) / 2 + Math.sin(v.angle) * tailLength * 0.3,
      (y + prevY) / 2 + Math.cos(v.angle) * tailLength * 0.3,
      prevX, prevY
    );

    ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.lineWidth = v.size;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 墨点
    ctx.beginPath();
    ctx.arc(x, y, v.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.6)';
    ctx.fill();
    ctx.restore();
  };

  // 动画循环
  const animate = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { particles, inkDrops, vortex } = animationRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 清空画布
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制背景烟雾
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5; i++) {
      const time = Date.now() * 0.0001;
      const x = centerX + Math.sin(time + i) * 200;
      const y = centerY + Math.cos(time * 0.7 + i) * 150;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 300);
      gradient.addColorStop(0, 'rgba(80, 80, 80, 0.5)');
      gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // 更新和绘制漩涡粒子
    vortex.forEach(v => {
      v.angle += v.speed;
      v.radius -= v.speed * 0.5;
      v.opacity = Math.max(0, v.opacity - 0.002);
      if (v.radius > 0 && v.opacity > 0) {
        drawVortex(v, ctx, centerX, centerY);
      }
    });

    // 更新和绘制墨滴
    inkDrops.forEach((drop, i) => {
      drop.progress += 0.008;
      drop.x += (drop.targetX - drop.x) * 0.015;
      drop.y += (drop.targetY - drop.y) * 0.015;
      drop.spread = Math.sin(drop.progress * Math.PI) * 20;
      if (drop.progress < 1) {
        drawInkDrop(drop, ctx);
      }
    });

    // 更新和绘制漂浮粒子
    particles.forEach(p => {
      p.x += p.vx + Math.sin(p.life * 0.01) * 0.1;
      p.y += p.vy + Math.cos(p.life * 0.01) * 0.1;
      p.life++;
      p.opacity = Math.sin((p.life / p.maxLife) * Math.PI) * 0.4;

      // 边界检测
      if (p.x < -50) p.x = canvas.width + 50;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = canvas.height + 50;
      if (p.y > canvas.height + 50) p.y = -50;

      drawParticle(p, ctx);
    });

    requestAnimationFrame(animate);
  }, []);

  // 初始化
  useEffect(() => {
    if (!autoPlay) return;

    const loadGSAP = () => {
      return new Promise<void>((resolve) => {
        if (window.gsap) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      await loadGSAP();

      if (!containerRef.current || !window.gsap) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // 设置 canvas 尺寸
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // 初始化粒子
      const particles: Particle[] = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.2,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.3,
          life: 0,
          maxLife: Math.random() * 300 + 150,
          canvas
        });
      }
      animationRef.current.particles = particles;

      // 初始化墨滴
      const inkDrops: InkDrop[] = [];
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 200;
        inkDrops.push({
          x: canvas.width / 2 + Math.cos(angle) * distance,
          y: canvas.height / 2 + Math.sin(angle) * distance,
          targetX: canvas.width / 2,
          targetY: canvas.height / 2,
          size: 20 + Math.random() * 30,
          progress: 0,
          opacity: 1,
          spread: 0,
          canvas
        });
      }
      animationRef.current.inkDrops = inkDrops;

      // 初始化漩涡粒子
      const vortex: VortexParticle[] = [];
      for (let i = 0; i < 60; i++) {
        vortex.push({
          angle: Math.random() * Math.PI * 2,
          radius: 50 + Math.random() * 200,
          speed: 0.02 + Math.random() * 0.03,
          size: 2 + Math.random() * 4,
          opacity: 0.3 + Math.random() * 0.5,
          canvas
        });
      }
      animationRef.current.vortex = vortex;

      // 开始动画循环
      animate();

      // 创建 GSAP 时间线
      const tl = window.gsap.timeline({
        onComplete: () => {
          onComplete();
        }
      });

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // ===== 第一幕：混沌 (0-2s) =====
      // 中心光点渐亮
      tl.to('.chaos-glow', {
        opacity: 0.6,
        scale: 1.5,
        duration: 2,
        ease: 'power2.inOut'
      }, 0);

      // ===== 第二幕：墨迹汇聚 (2-5s) =====
      // 墨滴向中心汇聚
      inkDrops.forEach((drop, i) => {
        tl.to(drop, {
          progress: 1,
          duration: 2,
          ease: 'power2.out'
        }, 1.5 + i * 0.1);
      });

      // 漩涡开始形成
      tl.to('.vortex-container', {
        opacity: 1,
        duration: 2,
        ease: 'power2.in'
      }, 2);

      // ===== 第三幕：太极诞生 (5-8s) =====
      // 太极显现
      tl.to('.taiji-main', {
        opacity: 1,
        scale: 1,
        duration: 3,
        ease: 'power3.out'
      }, 4.5);

      // 太极旋转
      tl.to('.taiji-svg', {
        rotation: 360,
        duration: 4,
        ease: 'power1.inOut'
      }, 5);

      // ===== 第四幕：能量觉醒 (8-11s) =====
      // 旋转加速
      tl.to('.taiji-svg', {
        rotation: 1080,
        duration: 2.5,
        ease: 'power2.in'
      }, 7.5);

      // 光芒增强
      tl.to('.taiji-glow', {
        opacity: 0.8,
        scale: 1.5,
        duration: 1.5,
        ease: 'power2.out'
      }, 8);

      // 突然停止
      tl.to('.taiji-svg', {
        rotation: 1080,
        duration: 0.3,
        ease: 'power4.out'
      }, 10);

      // ===== 第五幕：阴阳分化 (11-14s) =====
      tl.to('.yin-body', {
        x: -30,
        opacity: 0.9,
        duration: 2,
        ease: 'power2.inOut'
      }, 11);

      tl.to('.yang-body', {
        x: 30,
        opacity: 0.9,
        duration: 2,
        ease: 'power2.inOut'
      }, 11);

      // ===== 第六幕：四象演化 (14-17s) =====
      tl.to('.four-symbols', {
        opacity: 1,
        scale: 1,
        duration: 2.5,
        ease: 'power2.out'
      }, 13.5);

      // 四象旋转
      tl.to('.four-symbols', {
        rotation: 360,
        duration: 3,
        ease: 'power1.inOut'
      }, 14.5);

      // ===== 第七幕：八卦生成 (17-22s) =====
      tl.to('.bagua-container', {
        opacity: 1,
        duration: 2,
        ease: 'power2.inOut'
      }, 16);

      // 八卦爻线逐条显现
      document.querySelectorAll('.gua-yao').forEach((yao, i) => {
        tl.fromTo(yao,
          {
            opacity: 0,
            y: 10
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          },
          16.5 + i * 0.15
        );
      });

      // 八卦旋转
      tl.to('.bagua-svg', {
        rotation: 180,
        duration: 4,
        ease: 'power1.inOut'
      }, 17);

      // ===== 第八幕：天地共鸣 (22-26s) =====
      // 水墨冲击波
      tl.to('.ink-shockwave', {
        scale: 8,
        opacity: 0,
        duration: 2,
        ease: 'power2.out'
      }, 22);

      tl.to('.ink-shockwave', {
        scale: 0,
        opacity: 0.8,
        duration: 0.5,
        ease: 'power2.in'
      }, 24);

      // 最终状态
      tl.to('.final-text', {
        opacity: 1,
        y: 0,
        duration: 2,
        ease: 'power2.out'
      }, 23);

      // 太极八卦完全显现
      tl.to('.taiji-svg', {
        rotation: 360,
        duration: 20,
        ease: 'none'
      }, 24);

      tl.to('.bagua-svg', {
        rotation: 180,
        duration: 30,
        ease: 'none'
      }, 24);

      timelineRef.current = tl;
    };

    init();

    return () => {
      window.removeEventListener('resize', () => {});
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [autoPlay, animate, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ backgroundColor: '#050505' }}
    >
      {/* 背景 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 中心光点 - 第一幕 */}
      <div
        className="chaos-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20 blur-sm"
        style={{ opacity: 0 }}
      />

      {/* 漩涡容器 - 第二幕 */}
      <div
        className="vortex-container absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
      >
        <svg width="400" height="400" viewBox="-200 -200 400 400">
          {/* 漩涡线条 */}
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d={`M ${-150 + i * 10} ${-150 + i * 10} Q 0 0 ${150 - i * 10} ${150 - i * 10}`}
              fill="none"
              stroke="rgba(40, 40, 40, 0.3)"
              strokeWidth="1"
              className="vortex-line"
              style={{
                animation: `vortexSpin ${10 + i}s linear infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </svg>
      </div>

      {/* 太极主体 - 第三幕 */}
      <div
        className="taiji-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
        style={{ scale: 1.5 }}
      >
        {/* 外发光 */}
        <div
          className="taiji-glow absolute inset-0 w-64 h-64 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(80, 70, 60, 0.3) 0%, transparent 70%)',
            opacity: 0,
            transform: 'translate(-50%, -50%)'
          }}
        />

        <svg
          className="taiji-svg w-64 h-64 md:w-96 md:h-96"
          viewBox="-100 -100 200 200"
          style={{ willChange: 'transform' }}
        >
          <defs>
            {/* 墨迹模糊 */}
            <filter id="ink-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
            {/* 墨迹不规则边缘 */}
            <filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>
            {/* 水墨渐变 */}
            <radialGradient id="yin-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id="yang-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8f8f5" />
              <stop offset="100%" stopColor="#e8e8e0" />
            </radialGradient>
          </defs>

          {/* 外圈 - 墨迹效果 */}
          <circle
            cx="0" cy="0" r="95"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="8"
            filter="url(#ink-rough)"
          />

          {/* 太极本体 */}
          <g filter="url(#ink-soft)">
            {/* 阴半边（黑） */}
            <path
              d="M0,-90 A90,90 0 0,1 0,90 A45,45 0 0,0 0,0 A45,45 0 0,1 0,-90"
              fill="url(#yin-gradient)"
            />

            {/* 阳半边（白） */}
            <path
              d="M0,-90 A90,90 0 0,0 0,90 A45,45 0 0,1 0,0 A45,45 0 0,0 0,-90"
              fill="url(#yang-gradient)"
            />

            {/* 阴鱼（白眼） */}
            <circle cx="0" cy="45" r="22" fill="url(#yin-gradient)" />
            <circle cx="0" cy="45" r="9" fill="url(#yang-gradient)" />

            {/* 阳鱼（黑眼） */}
            <circle cx="0" cy="-45" r="22" fill="url(#yang-gradient)" />
            <circle cx="0" cy="-45" r="9" fill="url(#yin-gradient)" />
          </g>
        </svg>
      </div>

      {/* 阴阳分化 - 第五幕 */}
      <div className="yin-body absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0">
        <svg width="80" height="160" viewBox="-40 -80 80 160">
          <path d="M0,-80 A40,80 0 0,1 0,80 A40,40 0 0,0 0,0 A40,40 0 0,1 0,-80" fill="#1a1a1a" />
          <circle cx="0" cy="40" r="10" fill="#f8f8f5" />
        </svg>
      </div>

      <div className="yang-body absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0">
        <svg width="80" height="160" viewBox="-40 -80 80 160">
          <path d="M0,-80 A40,80 0 0,0 0,80 A40,40 0 0,1 0,0 A40,40 0 0,0 0,-80" fill="#f8f8f5" />
          <circle cx="0" cy="-40" r="10" fill="#1a1a1a" />
        </svg>
      </div>

      {/* 四象 - 第六幕 */}
      <div
        className="four-symbols absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
        style={{ scale: 0.8 }}
      >
        <svg width="400" height="400" viewBox="-200 -200 400 400">
          {/* 少阳 */}
          <g transform="translate(0,-130)" className="gua-yao">
            <line x1="-35" y1="-8" x2="35" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
            <line x1="-35" y1="8" x2="35" y2="8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
          </g>
          {/* 老阳 */}
          <g transform="translate(130,0)" className="gua-yao">
            <line x1="-35" y1="-8" x2="35" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
            <line x1="-35" y1="8" x2="35" y2="8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
          </g>
          {/* 少阴 */}
          <g transform="translate(0,130)" className="gua-yao">
            <g>
              <line x1="-35" y1="-8" x2="-5" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
              <line x1="5" y1="-8" x2="35" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
            </g>
            <g>
              <line x1="-35" y1="8" x2="-5" y2="8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
              <line x1="5" y1="8" x2="35" y2="8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
            </g>
          </g>
          {/* 老阴 */}
          <g transform="translate(-130,0)" className="gua-yao">
            <g>
              <line x1="-35" y1="-8" x2="-5" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
              <line x1="5" y1="-8" x2="35" y2="-8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
            </g>
            <line x1="-35" y1="8" x2="35" y2="8" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* 八卦 - 第七幕 */}
      <div
        className="bagua-container absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
      >
        <svg
          className="bagua-svg w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
          viewBox="-400 -400 800 800"
          style={{ willChange: 'transform' }}
        >
          {/* 定义爻线 */}
          <defs>
            <g id="yao-yang">
              <line
                x1="-45" y1="0" x2="45" y2="0"
                stroke="#2a2a2a"
                strokeWidth="7"
                strokeLinecap="round"
                className="gua-yao"
              />
            </g>
            <g id="yao-yin">
              <line x1="-45" y1="0" x2="-10" y2="0" stroke="#2a2a2a" strokeWidth="7" strokeLinecap="round" className="gua-yao" />
              <line x1="10" y1="0" x2="45" y2="0" stroke="#2a2a2a" strokeWidth="7" strokeLinecap="round" className="gua-yao" />
            </g>
          </defs>

          {/* ☰ 乾 (上) */}
          <g transform="translate(0,-280)">
            <use href="#yao-yang" y="-20" />
            <use href="#yao-yang" />
            <use href="#yao-yang" y="20" />
          </g>

          {/* ☱ 兑 (右上) */}
          <g transform="translate(198,-198)">
            <use href="#yao-yang" y="-20" />
            <use href="#yao-yang" />
            <use href="#yao-yin" y="20" />
          </g>

          {/* ☲ 离 (右) */}
          <g transform="translate(280,0)">
            <use href="#yao-yang" y="-20" />
            <use href="#yao-yin" />
            <use href="#yao-yang" y="20" />
          </g>

          {/* ☳ 震 (右下) */}
          <g transform="translate(198,198)">
            <use href="#yao-yin" y="-20" />
            <use href="#yao-yang" />
            <use href="#yao-yang" y="20" />
          </g>

          {/* ☷ 坤 (下) */}
          <g transform="translate(0,280)">
            <use href="#yao-yin" y="-20" />
            <use href="#yao-yin" />
            <use href="#yao-yin" y="20" />
          </g>

          {/* ☶ 艮 (左下) */}
          <g transform="translate(-198,198)">
            <use href="#yao-yang" y="-20" />
            <use href="#yao-yin" />
            <use href="#yao-yin" y="20" />
          </g>

          {/* ☵ 坎 (左) */}
          <g transform="translate(-280,0)">
            <use href="#yao-yin" y="-20" />
            <use href="#yao-yang" />
            <use href="#yao-yin" y="20" />
          </g>

          {/* ☴ 巽 (左上) */}
          <g transform="translate(-198,-198)">
            <use href="#yao-yang" y="-20" />
            <use href="#yao-yin" />
            <use href="#yao-yang" y="20" />
          </g>
        </svg>
      </div>

      {/* 水墨冲击波 - 第八幕 */}
      <div
        className="ink-shockwave absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/10"
        style={{ opacity: 0, willChange: 'transform' }}
      />

      {/* 最终文字 */}
      <div
        className="final-text absolute bottom-20 left-1/2 -translate-x-1/2 text-center opacity-0"
        style={{ transform: 'translateX(-50%) translateY(20px)' }}
      >
        <p className="text-white/40 text-sm md:text-base tracking-[0.3em] font-light leading-relaxed">
          太极生两仪
        </p>
        <p className="text-white/30 text-xs md:text-sm tracking-[0.2em] font-light mt-2">
          两仪生四象 · 四象生八卦
        </p>
      </div>

      <style>{`
        @keyframes vortexSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CinematicTaiji;
