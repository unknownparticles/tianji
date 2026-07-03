
/**
 * 电影级水墨风太极八卦动画
 * 「太极生两仪，两仪生四象，四象生八卦」
 */

import React, { useEffect, useRef } from 'react';

interface CinematicTaijiProps {
  onComplete: () => void;
  onFetch?: () => void;
}

declare global {
  interface Window {
    gsap: any;
  }
}

const CinematicTaiji: React.FC<CinematicTaijiProps> = ({ onComplete, onFetch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadGSAP = () => {
      return new Promise<void>((resolve) => {
        if (window.gsap) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      await loadGSAP();
      if (!containerRef.current || !window.gsap || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置 canvas
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // 粒子系统
      interface Particle {
        x: number; y: number; vx: number; vy: number;
        size: number; opacity: number; life: number; maxLife: number;
      }

      const particles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3 - 0.1,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.2,
          life: Math.random() * 200,
          maxLife: 200 + Math.random() * 100
        });
      }

      // 动画循环
      let animId: number;
      const animate = () => {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          p.opacity = Math.sin((p.life / p.maxLife) * Math.PI) * 0.3;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(60, 60, 60, ${p.opacity})`;
          ctx.fill();
        });

        animId = requestAnimationFrame(animate);
      };
      animate();

      // 创建时间线
      const tl = window.gsap.timeline({
        onComplete: () => {
          cancelAnimationFrame(animId);
          window.removeEventListener('resize', resize);
          onComplete();
          // 动画完成后获取解读
          if (onFetch) onFetch();
        }
      });

      // 第一幕：混沌
      tl.to('.chaos-glow', { opacity: 0.8, scale: 2, duration: 2, ease: 'power2.inOut' }, 0);

      // 第二幕：墨迹汇聚
      tl.to('.vortex-container', { opacity: 1, duration: 2, ease: 'power2.in' }, 1.5);

      // 第三幕：太极诞生
      tl.to('.taiji-main', { opacity: 1, scale: 1, duration: 3, ease: 'power3.out' }, 3);

      // 第四幕：旋转加速
      tl.to('.taiji-svg', { rotation: 720, duration: 3, ease: 'power2.in' }, 5);

      // 突然停止
      tl.to('.taiji-svg', { rotation: 720, duration: 0.5, ease: 'power4.out' }, 8);

      // 第五幕：阴阳分化
      tl.to('.yin-part', { x: -40, opacity: 0.9, duration: 2, ease: 'power2.inOut' }, 8.5);
      tl.to('.yang-part', { x: 40, opacity: 0.9, duration: 2, ease: 'power2.inOut' }, 8.5);

      // 第六幕：四象
      tl.to('.four-symbols', { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, 10);

      // 第七幕：八卦
      tl.to('.bagua-container', { opacity: 1, duration: 2, ease: 'power2.inOut' }, 12);

      // 八卦爻线显现
      document.querySelectorAll('.gua-yao').forEach((el, i) => {
        tl.fromTo(el, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 12 + i * 0.1);
      });

      // 八卦旋转
      tl.to('.bagua-svg', { rotation: 180, duration: 5, ease: 'power1.inOut' }, 13);

      // 第八幕：冲击波
      tl.to('.ink-shockwave', { scale: 6, opacity: 0, duration: 2, ease: 'power2.out' }, 18);
      tl.to('.final-text', { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }, 18);

      // 持续旋转
      tl.to('.taiji-svg', { rotation: 1080, duration: 30, ease: 'none' }, 20);
      tl.to('.bagua-svg', { rotation: 360, duration: 40, ease: 'none' }, 20);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
      };
    };

    init();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5, 5, 5, 0.95)' }}
    >
      {/* 背景 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 中心光点 */}
      <div className="chaos-glow absolute w-2 h-2 rounded-full bg-white/30 blur-sm opacity-0" />

      {/* 漩涡 */}
      <div className="vortex-container absolute opacity-0">
        <svg width="300" height="300" viewBox="-150 -150 300 300">
          {[...Array(6)].map((_, i) => (
            <ellipse
              key={i}
              cx="0" cy="0"
              rx={30 + i * 15}
              ry={60 + i * 20}
              fill="none"
              stroke={`rgba(50, 50, 50, ${0.3 - i * 0.04})`}
              strokeWidth="1"
              style={{ animation: `spin ${8 + i}s linear infinite`, animationDirection: i % 2 === 0 ? 'normal' : 'reverse' }}
            />
          ))}
        </svg>
      </div>

      {/* 太极主体 */}
      <div className="taiji-main absolute flex items-center justify-center opacity-0" style={{ scale: 1.5 }}>
        <svg className="taiji-svg w-64 h-64 md:w-80 md:h-80" viewBox="-100 -100 200 200">
          {/* 外圈 */}
          <circle cx="0" cy="0" r="95" fill="none" stroke="#2a2a2a" strokeWidth="4" />

          {/* 阴 */}
          <path d="M0,-90 A90,90 0 0,1 0,90 A45,45 0 0,0 0,0 A45,45 0 0,1 0,-90" fill="#0a0a0a" />
          {/* 阳 */}
          <path d="M0,-90 A90,90 0 0,0 0,90 A45,45 0 0,1 0,0 A45,45 0 0,0 0,-90" fill="#f5f5f0" />
          {/* 鱼眼 */}
          <circle cx="0" cy="-45" r="20" fill="#f5f5f0" />
          <circle cx="0" cy="-45" r="7" fill="#0a0a0a" />
          <circle cx="0" cy="45" r="20" fill="#0a0a0a" />
          <circle cx="0" cy="45" r="7" fill="#f5f5f0" />
        </svg>
      </div>

      {/* 阴阳分离 */}
      <div className="yin-part absolute flex items-center justify-center opacity-0" style={{ x: 0 }}>
        <svg width="60" height="120" viewBox="-30 -60 60 120">
          <path d="M0,-60 A30,60 0 0,1 0,60 A30,30 0 0,0 0,0 A30,30 0 0,1 0,-60" fill="#0a0a0a" />
          <circle cx="0" cy="30" r="8" fill="#f5f5f0" />
        </svg>
      </div>

      <div className="yang-part absolute flex items-center justify-center opacity-0" style={{ x: 0 }}>
        <svg width="60" height="120" viewBox="-30 -60 60 120">
          <path d="M0,-60 A30,60 0 0,0 0,60 A30,30 0 0,1 0,0 A30,30 0 0,0 0,-60" fill="#f5f5f0" />
          <circle cx="0" cy="-30" r="8" fill="#0a0a0a" />
        </svg>
      </div>

      {/* 四象 */}
      <div className="four-symbols absolute flex items-center justify-center opacity-0" style={{ scale: 0.8 }}>
        <svg width="350" height="350" viewBox="-175 -175 350 350">
          {/* 少阳 */}
          <g transform="translate(0,-100)">
            <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
          </g>
          {/* 老阳 */}
          <g transform="translate(100,0)">
            <line x1="-25" y1="-5" x2="25" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
          </g>
          {/* 老阴 */}
          <g transform="translate(0,100)">
            <line x1="-25" y1="-5" x2="-5" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="5" y1="-5" x2="25" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="-25" y1="5" x2="-5" y2="5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="5" y1="5" x2="25" y2="5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
          </g>
          {/* 少阴 */}
          <g transform="translate(-100,0)">
            <line x1="-25" y1="-5" x2="-5" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="5" y1="-5" x2="25" y2="-5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
            <line x1="-25" y1="5" x2="25" y2="5" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* 八卦 */}
      <div className="bagua-container absolute flex items-center justify-center opacity-0">
        <svg className="bagua-svg w-[500px] h-[500px] md:w-[600px] md:h-[600px]" viewBox="-300 -300 600 600">
          <defs>
            <g id="yao-yang">
              <line x1="-35" y1="0" x2="35" y2="0" stroke="#2a2a2a" strokeWidth="5" strokeLinecap="round" className="gua-yao" />
            </g>
            <g id="yao-yin">
              <line x1="-35" y1="0" x2="-8" y2="0" stroke="#2a2a2a" strokeWidth="5" strokeLinecap="round" className="gua-yao" />
              <line x1="8" y1="0" x2="35" y2="0" stroke="#2a2a2a" strokeWidth="5" strokeLinecap="round" className="gua-yao" />
            </g>
          </defs>

          {/* ☰ 乾 */}
          <g transform="translate(0,-220)">
            <use href="#yao-yang" y="-18" />
            <use href="#yao-yang" />
            <use href="#yao-yang" y="18" />
          </g>
          {/* ☱ 兑 */}
          <g transform="translate(155,-155)">
            <use href="#yao-yang" y="-18" />
            <use href="#yao-yang" />
            <use href="#yao-yin" y="18" />
          </g>
          {/* ☲ 离 */}
          <g transform="translate(220,0)">
            <use href="#yao-yang" y="-18" />
            <use href="#yao-yin" />
            <use href="#yao-yang" y="18" />
          </g>
          {/* ☳ 震 */}
          <g transform="translate(155,155)">
            <use href="#yao-yin" y="-18" />
            <use href="#yao-yang" />
            <use href="#yao-yang" y="18" />
          </g>
          {/* ☷ 坤 */}
          <g transform="translate(0,220)">
            <use href="#yao-yin" y="-18" />
            <use href="#yao-yin" />
            <use href="#yao-yin" y="18" />
          </g>
          {/* ☶ 艮 */}
          <g transform="translate(-155,155)">
            <use href="#yao-yang" y="-18" />
            <use href="#yao-yin" />
            <use href="#yao-yin" y="18" />
          </g>
          {/* ☵ 坎 */}
          <g transform="translate(-220,0)">
            <use href="#yao-yin" y="-18" />
            <use href="#yao-yang" />
            <use href="#yao-yin" y="18" />
          </g>
          {/* ☴ 巽 */}
          <g transform="translate(-155,-155)">
            <use href="#yao-yang" y="-18" />
            <use href="#yao-yin" />
            <use href="#yao-yang" y="18" />
          </g>
        </svg>
      </div>

      {/* 冲击波 */}
      <div className="ink-shockwave absolute w-4 h-4 rounded-full bg-white/20 blur-sm scale-0" />

      {/* 最终文字 */}
      <div className="final-text absolute bottom-20 text-center opacity-0" style={{ y: 20 }}>
        <p className="text-white/40 text-sm tracking-[0.3em]">太极生两仪</p>
        <p className="text-white/30 text-xs tracking-[0.2em] mt-2">两仪生四象 · 四象生八卦</p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CinematicTaiji;
