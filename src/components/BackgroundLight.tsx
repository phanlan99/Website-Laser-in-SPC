import type { ReactNode } from "react";

/* ==================================================================
   BackgroundLight – nền sáng cho các trang làm việc (thống kê, bảng…)
   - Nền trắng xanh nhạt, 3 quầng màu (xanh / đồng / tím nhạt) trôi chậm
   - Lưới chấm kiểu "dot-matrix" như bề mặt khắc, có dải sáng màu đồng
     quét chéo làm các chấm bừng sáng theo nhịp
   - Vạch quét laser xanh mảnh chạy từ trên xuống
   - Dấu định vị (crosshair) ở góc, xoay chậm
   ================================================================== */

type BackgroundLightProps = {
  children?: ReactNode;
  className?: string;
  /** class cho lớp chứa nội dung (vd: flex layout) */
  contentClassName?: string;
};

const CSS = `
.lb-bg{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(180deg,#f8f9fd 0%,#eef2f9 100%);color:#0f1a2e}
.lb-layer{position:fixed;inset:0;pointer-events:none}
.lb-blob{position:absolute;border-radius:50%;filter:blur(56px);opacity:.8;will-change:transform}
.lb-blob-a{width:46vmax;height:46vmax;left:-12vmax;top:-16vmax;background:radial-gradient(circle,#cddaff 0%,rgba(205,218,255,0) 70%);animation:lb-drift-a 26s ease-in-out infinite alternate}
.lb-blob-b{width:40vmax;height:40vmax;right:-14vmax;top:8vh;background:radial-gradient(circle,#f4e4c4 0%,rgba(244,228,196,0) 70%);animation:lb-drift-b 32s ease-in-out infinite alternate}
.lb-blob-c{width:42vmax;height:42vmax;left:28%;bottom:-22vmax;background:radial-gradient(circle,#e0dbff 0%,rgba(224,219,255,0) 70%);animation:lb-drift-c 29s ease-in-out infinite alternate}
.lb-dots{background-image:radial-gradient(circle,rgba(29,63,143,.14) 1px,transparent 1.6px);background-size:22px 22px;-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.3) 55%,rgba(0,0,0,.75));mask-image:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.3) 55%,rgba(0,0,0,.75))}
.lb-dots-hot{background-image:radial-gradient(circle,rgba(176,138,74,.9) 1.2px,transparent 1.8px);background-size:22px 22px;-webkit-mask-image:linear-gradient(115deg,transparent 44%,#000 50%,transparent 56%);mask-image:linear-gradient(115deg,transparent 44%,#000 50%,transparent 56%);-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;animation:lb-sweep 12s cubic-bezier(.45,0,.25,1) infinite}
.lb-highlight{background:radial-gradient(ellipse 70% 45% at 50% 0%,rgba(255,255,255,.85),transparent 70%)}
.lb-scan{position:absolute;left:0;right:0;top:0;height:140px;pointer-events:none;background:linear-gradient(180deg,transparent 0%,rgba(47,91,234,.05) 70%,rgba(47,91,234,.28) 98.5%,rgba(47,91,234,.6) 99.5%,transparent 100%);animation:lb-scan 10s linear infinite}
.lb-mark{position:fixed;width:64px;height:64px;color:rgba(29,63,143,.28);pointer-events:none}
.lb-mark-tr{top:20px;right:96px}
.lb-mark-bl{bottom:20px;right:24px}
.lb-mark .lb-ring{transform-box:fill-box;transform-origin:center;animation:lb-spin 40s linear infinite}
.lb-content{position:relative;z-index:1}
@keyframes lb-drift-a{to{transform:translate3d(8vw,6vh,0) scale(1.1)}}
@keyframes lb-drift-b{to{transform:translate3d(-7vw,10vh,0) scale(.92)}}
@keyframes lb-drift-c{to{transform:translate3d(-10vw,-6vh,0) scale(1.12)}}
@keyframes lb-sweep{0%{-webkit-mask-position:100% 0;mask-position:100% 0}65%,100%{-webkit-mask-position:0% 0;mask-position:0% 0}}
@keyframes lb-scan{from{transform:translateY(-140px)}to{transform:translateY(105vh)}}
@keyframes lb-spin{to{transform:rotate(360deg)}}
@media (max-width:640px){.lb-mark{display:none}}
@media (prefers-reduced-motion:reduce){
  .lb-bg *{animation:none!important}
  .lb-scan,.lb-dots-hot{display:none}
}
`;

const Mark = ({ className }: { className: string }) => (
  <svg className={`lb-mark ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden>
    <path d="M32 4v14M32 46v14M4 32h14M46 32h14" stroke="currentColor" strokeWidth="1.2" />
    <g className="lb-ring">
      <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
    </g>
    <circle cx="32" cy="32" r="2" fill="currentColor" />
  </svg>
);

export default function BackgroundLight({ children, className = "", contentClassName = "" }: BackgroundLightProps) {
  return (
    <div className={`lb-bg ${className}`}>
      <style>{CSS}</style>
      <div className="lb-layer" aria-hidden>
        <div className="lb-blob lb-blob-a" />
        <div className="lb-blob lb-blob-b" />
        <div className="lb-blob lb-blob-c" />
      </div>
      <div className="lb-layer lb-dots" aria-hidden />
      <div className="lb-layer lb-dots-hot" aria-hidden />
      <div className="lb-layer lb-highlight" aria-hidden />
      <div className="lb-layer" aria-hidden>
        <div className="lb-scan" />
      </div>
      <Mark className="lb-mark-tr" />
      <Mark className="lb-mark-bl" />
      <div className={`lb-content ${contentClassName}`}>{children}</div>
    </div>
  );
}