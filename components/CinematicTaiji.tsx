
/**
 * 电影级水墨风太极八卦动画
 */

import React, { useEffect, useRef } from 'react';

interface CinematicTaijiProps {
  onComplete: () => void;
  onFetch: () => void;
}

const CinematicTaiji: React.FC<CinematicTaijiProps> = ({ onComplete, onFetch }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (!containerRef.current || !window.gsap) return;

      const tl = window.gsap.timeline({
        onComplete: () => {
          onComplete();
          onFetch();
        }
      });

      // 混沌 - 中心光点
      tl.fromTo('.center-dot', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 2, ease: 'power2.inOut' }, 0);

      // 太极显现（使用CSS旋转）
      tl.fromTo('.taiji-wrap', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 3, ease: 'power3.out' }, 1);

      // 太极旋转加速（用CSS控制）
      tl.to('.taiji-wrap', { '--spin-duration': '1s', duration: 0.1 }, 2);
      tl.to('.taiji-wrap', { '--spin-duration': '0.5s', duration: 0.1 }, 4);
      tl.to('.taiji-wrap', { '--spin-duration': '0.3s', duration: 0.1 }, 5.5);

      // 太极淡化，八卦显现
      tl.to('.taiji-wrap', { opacity: 0, scale: 1.3, duration: 2, ease: 'power2.in' }, 7);
      tl.fromTo('.bagua-wrap', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' }, 7);

      // 八卦旋转
      tl.to('.bagua-wrap', { '--spin-duration': '2s', duration: 0.1 }, 8);

      // 八卦放大隐藏
      tl.to('.bagua-wrap', { scale: 1.5, opacity: 0, duration: 2, ease: 'power2.in' }, 14);

      // 最终文字
      tl.fromTo('.final-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' }, 15);
    };

    init();
  }, [onComplete, onFetch]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .taiji-wrap, .bagua-wrap {
          animation: spin var(--spin-duration, 3s) linear infinite;
        }
      `}</style>

      {/* 中心光点 */}
      <div className="center-dot absolute w-2 h-2 rounded-full bg-white/30 blur-sm opacity-0" />

      {/* 太极 SVG - 200x200 */}
      <div className="taiji-wrap absolute opacity-0" style={{ width: 200, height: 200 }}>
        <svg viewBox="-100 -100 200 200" width="200" height="200">
          {/* 外圆 */}
          <circle cx="0" cy="0" r="100" fill="white" stroke="#333" strokeWidth="2" />
          {/* 黑色半边 */}
          <path d="M0,-100 A100,100 0 0,1 0,100 A50,50 0 0,0 0,0 A50,50 0 0,1 0,-100" fill="black" />
          {/* 白色上鱼 */}
          <circle cx="0" cy="-50" r="50" fill="white" />
          {/* 黑色下鱼 */}
          <circle cx="0" cy="50" r="50" fill="black" />
          {/* 阳眼 */}
          <circle cx="0" cy="-50" r="10" fill="black" />
          {/* 阴眼 */}
          <circle cx="0" cy="50" r="10" fill="white" />
        </svg>
      </div>

      {/* 八卦 SVG - 500x500，保持和太极相同的视觉比例 */}
      <div className="bagua-wrap absolute opacity-0" style={{ width: 500, height: 500 }}>
        <svg viewBox="-250 -250 500 500" width="500" height="500">
          {/* 中心太极 - 保持和上面太极一致的大小 */}
          <g>
            <circle cx="0" cy="0" r="100" fill="white" stroke="#333" strokeWidth="2" />
            <path fill="black" d="M0,-100 A100,100 0 0,1 0,100 A50,50 0 0,0 0,0 A50,50 0 0,1 0,-100Z" />
            <circle cx="0" cy="-50" r="50" fill="white" />
            <circle cx="0" cy="50" r="50" fill="black" />
            <circle cx="0" cy="-50" r="10" fill="black" />
            <circle cx="0" cy="50" r="10" fill="white" />
          </g>

          <defs>
            <g id="yang">
              <rect x="-35" y="-4" width="70" height="8" fill="#333" rx="2" />
            </g>
            <g id="yin">
              <rect x="-35" y="-4" width="26" height="8" fill="#333" rx="2" />
              <rect x="9" y="-4" width="26" height="8" fill="#333" rx="2" />
            </g>
          </defs>

          {/* 八卦在外圈 */}
          {/* ☰ 乾 */}
          <g transform="translate(0,-170)">
            <use href="#yang" y="-24" />
            <use href="#yang" />
            <use href="#yang" y="24" />
          </g>
          {/* ☱ 兑 */}
          <g transform="translate(120,-120)">
            <use href="#yang" y="-24" />
            <use href="#yang" />
            <use href="#yin" y="24" />
          </g>
          {/* ☲ 离 */}
          <g transform="translate(170,0)">
            <use href="#yang" y="-24" />
            <use href="#yin" />
            <use href="#yang" y="24" />
          </g>
          {/* ☳ 震 */}
          <g transform="translate(120,120)">
            <use href="#yin" y="-24" />
            <use href="#yang" />
            <use href="#yang" y="24" />
          </g>
          {/* ☷ 坤 */}
          <g transform="translate(0,170)">
            <use href="#yin" y="-24" />
            <use href="#yin" />
            <use href="#yin" y="24" />
          </g>
          {/* ☶ 艮 */}
          <g transform="translate(-120,120)">
            <use href="#yang" y="-24" />
            <use href="#yin" />
            <use href="#yin" y="24" />
          </g>
          {/* ☵ 坎 */}
          <g transform="translate(-170,0)">
            <use href="#yin" y="-24" />
            <use href="#yang" />
            <use href="#yin" y="24" />
          </g>
          {/* ☴ 巽 */}
          <g transform="translate(-120,-120)">
            <use href="#yang" y="-24" />
            <use href="#yin" />
            <use href="#yang" y="24" />
          </g>
        </svg>
      </div>

      {/* 最终文字 */}
      <div className="final-text absolute bottom-20 text-center opacity-0" style={{ y: 20 }}>
        <p className="text-white/50 text-sm tracking-[0.3em]">太极生两仪</p>
        <p className="text-white/40 text-xs tracking-[0.2em] mt-2">两仪生四象 · 四象生八卦</p>
      </div>
    </div>
  );
};

export default CinematicTaiji;
