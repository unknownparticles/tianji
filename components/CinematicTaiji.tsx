
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
    // 动态加载 GSAP
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

      // 太极显现
      tl.fromTo('.taiji-svg', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 3, ease: 'power3.out' }, 1);

      // 太极旋转
      tl.to('.taiji-rotate', { rotation: 360, duration: 3, ease: 'power1.inOut' }, 2);

      // 加速旋转
      tl.to('.taiji-rotate', { rotation: 1080, duration: 2, ease: 'power2.in' }, 5);

      // 突然停止
      tl.to('.taiji-rotate', { rotation: 1080, duration: 0.3, ease: 'power4.out' }, 7);

      // 太极消失，八卦显现
      tl.to('.taiji-svg', { opacity: 0, scale: 1.5, duration: 1, ease: 'power2.in' }, 7.5);
      tl.fromTo('.bagua-svg', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' }, 8);

      // 八卦旋转
      tl.to('.bagua-rotate', { rotation: 360, duration: 8, ease: 'power1.inOut' }, 9);

      // 冲击波
      tl.fromTo('.shockwave', { scale: 0, opacity: 1 }, { scale: 8, opacity: 0, duration: 2, ease: 'power2.out' }, 15);
    };

    init();
  }, [onComplete, onFetch]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: '#050505' }}
    >
      {/* 中心光点 */}
      <div className="center-dot absolute w-2 h-2 rounded-full bg-white/30 blur-sm opacity-0" />

      {/* 太极 SVG */}
      <div className="taiji-svg absolute opacity-0">
        <div className="taiji-rotate">
          <svg viewBox="-100 -100 200 200" width="200" height="200">
            {/* 外圆 */}
            <circle cx="0" cy="0" r="100" fill="white" stroke="black" strokeWidth="2" />
            {/* 黑色半边 */}
            <path d="M0,-100 A100,100 0 0 1 0,100 A50,50 0 0 0 0,0 A50,50 0 0 1 0,-100" fill="black" />
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
      </div>

      {/* 八卦 SVG */}
      <div className="bagua-svg absolute opacity-0">
        <div className="bagua-rotate">
          <svg viewBox="-350 -350 700 700" width="600" height="600">
            {/* 中心太极 */}
            <g>
              <circle cx="0" cy="0" r="80" fill="#fff" />
              <path fill="#000" d="M0,-80 A80,80 0 0 1 0,80 A40,40 0 0 0 0,0 A40,40 0 0 1 0,-80Z" />
              <circle cx="0" cy="-40" r="40" fill="#fff" />
              <circle cx="0" cy="40" r="40" fill="#000" />
              <circle cx="0" cy="-40" r="8" fill="#000" />
              <circle cx="0" cy="40" r="8" fill="#fff" />
            </g>

            <defs>
              <g id="yang">
                <rect x="-40" y="-5" width="80" height="10" fill="#000" />
              </g>
              <g id="yin">
                <rect x="-40" y="-5" width="30" height="10" fill="#000" />
                <rect x="10" y="-5" width="30" height="10" fill="#000" />
              </g>
            </defs>

            {/* ☰ 乾 */}
            <g transform="translate(0,-220)">
              <use href="#yang" y="-30" />
              <use href="#yang" />
              <use href="#yang" y="30" />
            </g>
            {/* ☱ 兑 */}
            <g transform="translate(155,-155) rotate(45)">
              <use href="#yang" y="-30" />
              <use href="#yang" />
              <use href="#yin" y="30" />
            </g>
            {/* ☲ 离 */}
            <g transform="translate(220,0) rotate(90)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yang" y="30" />
            </g>
            {/* ☳ 震 */}
            <g transform="translate(155,155) rotate(135)">
              <use href="#yin" y="-30" />
              <use href="#yang" />
              <use href="#yang" y="30" />
            </g>
            {/* ☷ 坤 */}
            <g transform="translate(0,220)">
              <use href="#yin" y="-30" />
              <use href="#yin" />
              <use href="#yin" y="30" />
            </g>
            {/* ☶ 艮 */}
            <g transform="translate(-155,155) rotate(225)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yin" y="30" />
            </g>
            {/* ☵ 坎 */}
            <g transform="translate(-220,0) rotate(270)">
              <use href="#yin" y="-30" />
              <use href="#yang" />
              <use href="#yin" y="30" />
            </g>
            {/* ☴ 巽 */}
            <g transform="translate(-155,-155) rotate(315)">
              <use href="#yang" y="-30" />
              <use href="#yin" />
              <use href="#yang" y="30" />
            </g>
          </svg>
        </div>
      </div>

      {/* 冲击波 */}
      <div className="shockwave absolute w-4 h-4 rounded-full bg-white/20 blur-sm opacity-0" />

      {/* 最终文字 */}
      <div className="final-text absolute bottom-20 text-center opacity-0">
        <p className="text-white/40 text-sm tracking-[0.3em]">太极生两仪</p>
        <p className="text-white/30 text-xs tracking-[0.2em] mt-2">两仪生四象 · 四象生八卦</p>
      </div>
    </div>
  );
};

export default CinematicTaiji;
