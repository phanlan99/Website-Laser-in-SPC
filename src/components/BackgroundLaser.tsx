import type { CSSProperties, ReactNode } from "react";
import { appFont } from "../lib/fonts";

/* ==================================================================
   BackgroundLaser
   - Nền gradient tối lan tỏa từ tâm như giọt nước (ripple)
   - 3 góc nhìn máy khắc laser vẽ bằng SVG, có animation:
     đèn tháp, màn hình, tia laser khắc, quạt tản nhiệt...
   - Responsive desktop / mobile, tôn trọng prefers-reduced-motion
   ================================================================== */

type BackgroundLaserProps = {
  /** Nội dung hiển thị phía trên nền */
  children?: ReactNode;
  className?: string;
  /** Ẩn 3 hình máy + tiêu đề (chỉ giữ nền) cho các trang nhiều nội dung */
  showMachines?: boolean;
  /** Hiện 2 người đứng cạnh máy giữa */
  showPeople?: boolean;
  /** Tiêu đề phía trên 3 máy */
  title?: string;
};

const STROKE = "#7b86a6";

/* ------------------------------------------------------------------ */
/*  Defs: gradient, filter, clipPath (mỗi SVG một prefix riêng)        */
/* ------------------------------------------------------------------ */
function Defs({ p }: { p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-panel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f5fc" />
        <stop offset="1" stopColor="#d3d8ea" />
      </linearGradient>
      <linearGradient id={`${p}-frame`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#97a1c0" />
        <stop offset=".5" stopColor="#d2d8e8" />
        <stop offset="1" stopColor="#97a1c0" />
      </linearGradient>
      <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#cfd2ff" />
        <stop offset="1" stopColor="#959cec" />
      </linearGradient>
      <linearGradient id={`${p}-glassDark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f448c" />
        <stop offset="1" stopColor="#1d2050" />
      </linearGradient>
      <linearGradient id={`${p}-screen`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3b68ff" />
        <stop offset="1" stopColor="#0c2cc0" />
      </linearGradient>
      <linearGradient id={`${p}-dark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#363b56" />
        <stop offset="1" stopColor="#1b1e2d" />
      </linearGradient>
      <linearGradient id={`${p}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c3c8d8" />
        <stop offset="1" stopColor="#959cb4" />
      </linearGradient>
      <linearGradient id={`${p}-top`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#e9ecf6" />
        <stop offset="1" stopColor="#b4bacf" />
      </linearGradient>
      <linearGradient id={`${p}-beige`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4e8d6" />
        <stop offset="1" stopColor="#d4bfa2" />
      </linearGradient>
      <linearGradient id={`${p}-door`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6c7292" />
        <stop offset="1" stopColor="#3b4060" />
      </linearGradient>
      <linearGradient id={`${p}-sheen`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity=".45" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${p}-shadow`}>
        <stop offset="0" stopColor="#000" stopOpacity=".7" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <filter id={`${p}-glow`} x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath id={`${p}-clipScreen`}>
        <rect x="90" y="258" width="114" height="70" rx="2" />
      </clipPath>
      <clipPath id={`${p}-clipGlass`}>
        <rect x="82" y="180" width="130" height="72" rx="3" />
      </clipPath>
      <clipPath id={`${p}-clipMark`}>
        <rect x="119" y="359" width="54" height="40" rx="3" />
      </clipPath>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/*  Chi tiết nhỏ                                                       */
/* ------------------------------------------------------------------ */
const Screw = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r="1.4" fill="#5d6785" />;

const Handle = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x} y={y} width="16" height="40" rx="2" fill="#c2c9de" stroke={STROKE} strokeWidth=".8" />
    <rect x={x + 4} y={y + 5} width="8" height="30" rx="1.5" fill={STROKE} />
  </g>
);

const Caster = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-13" y="0" width="26" height="5" rx="1" fill="#3b4260" />
    <rect x="-3" y="5" width="6" height="6" fill="#8e98b8" />
    <circle cx="0" cy="20" r="10" fill="#a9b1c9" stroke="#5d6785" />
    <circle cx="0" cy="20" r="4" fill="#4a5270" />
    <rect x="8" y="9" width="6" height="9" rx="1" fill="#c6ccdd" stroke="#5d6785" strokeWidth=".6" />
  </g>
);

/** Quạt tản nhiệt – cánh quạt quay bằng CSS */
function Fan({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const blade = `M0 0 C ${r * 0.3} ${-r * 0.35} ${r * 0.8} ${-r * 0.3} ${r * 0.92} ${r * 0.05} C ${r * 0.6} ${r * 0.12} ${r * 0.3} ${r * 0.1} 0 0Z`;
  return (
    <g>
      <rect x={cx - r - 4} y={cy - r - 4} width={2 * r + 8} height={2 * r + 8} rx="3" fill="#252a3d" stroke="#4b5170" />
      <circle cx={cx} cy={cy} r={r} fill="#0d1019" stroke="#5d6785" />
      <g className="lm-fan">
        <circle cx={cx} cy={cy} r={r} fill="transparent" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={blade} transform={`translate(${cx} ${cy}) rotate(${i * 72})`} fill="#8590b0" />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#3a4060" stroke="#8590b0" strokeWidth=".6" />
      <circle cx={cx} cy={cy} r={r * 0.68} fill="none" stroke="#fff" strokeOpacity=".12" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tia laser khắc trong cửa sổ quan sát                               */
/* ------------------------------------------------------------------ */
function Laser({ p, begin }: { p: string; begin: string }) {
  // Đường khắc dạng "hatch fill" giống máy laser tô kín một vùng
  const hatch = "M124 366 h44 v6 h-44 v6 h44 v6 h-44 v6 h44 v6 h-44";
  const len = 294;
  const anim = { dur: "5s", begin, repeatCount: "indefinite" } as const;

  return (
    <g className="lm-laser">
      {/* Ánh sáng hắt trong buồng khắc */}
      <rect x="119" y="359" width="54" height="40" rx="3" fill="#ff7a3d" opacity="0">
        <animate attributeName="opacity" values="0;.22;.22;0;0" keyTimes="0;0.04;0.7;0.76;1" {...anim} />
      </rect>

      <g clipPath={`url(#${p}-clipMark)`}>
        <path
          id={`${p}-hatch`}
          d={hatch}
          fill="none"
          stroke="#ffb066"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={len}
          filter={`url(#${p}-glow)`}
        >
          <animate attributeName="stroke-dashoffset" values={`${len};0;0`} keyTimes="0;0.72;1" {...anim} />
          <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" {...anim} />
        </path>

        {/* Đầu tia + điểm khắc chạy theo đường hatch */}
        <g>
          <animateMotion keyPoints="0;1;1" keyTimes="0;0.72;1" calcMode="linear" {...anim}>
            <mpath href={`#${p}-hatch`} />
          </animateMotion>
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.72;0.73;1" {...anim} />
          <line x1="0" y1="-60" x2="0" y2="0" stroke="#ff5a36" strokeWidth="1.1" opacity=".85" filter={`url(#${p}-glow)`} />
          <circle r="5" fill="#ff7a3d" opacity=".45" filter={`url(#${p}-glow)`} />
          <circle r="1.8" fill="#fff6e8">
            <animate attributeName="r" values="1.5;2.4;1.5" dur="0.18s" repeatCount="indefinite" />
          </circle>
          {[
            [-5, -6, 0.42],
            [4, -4, 0.55],
            [6, -7, 0.68],
          ].map(([dx, dy, d], i) => (
            <circle key={i} r=".8" fill="#ffd28a">
              <animate attributeName="cx" values={`0;${dx}`} dur={`${d}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`0;${dy}`} dur={`${d}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Mặt trước máy (dùng chung cho cả 3 góc nhìn)                       */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Lắp ráp: mỗi cụm chi tiết bay vào vị trí theo thứ tự               */
/*  --md: thời điểm bắt đầu của từng máy, --ad: độ trễ của cụm,        */
/*  --ax/--ay: hướng cụm bay tới (đơn vị viewBox)                       */
/* ------------------------------------------------------------------ */
function Part({ d, x = 0, y = 0, children }: { d: number; x?: number; y?: number; children: ReactNode }) {
  return (
    <g className="lm-part" style={{ "--ad": `${d}s`, "--ax": `${x}px`, "--ay": `${y}px` } as CSSProperties}>
      {children}
    </g>
  );
}

/** Khung dây xanh "bản vẽ kỹ thuật" hiện ra trước khi lắp */
function Wire({ paths }: { paths: string[] }) {
  return (
    <g aria-hidden>
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} className="lm-wire" />
      ))}
    </g>
  );
}

/** Tia hàn laser chạy dọc mối nối khi 2 cụm khớp vào nhau */
function Weld({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <rect
      className="lm-weld"
      x={x}
      y={y}
      width={w}
      height="2.4"
      rx="1.2"
      fill="#ffc27a"
      style={{ "--wd": `${d}s` } as CSSProperties}
    />
  );
}

const FRONT_WIRE = [
  "M62 163 H234 V428 H62 Z",
  "M60 428 H260 V787 H60 Z",
  "M160 440 V787",
  "M86 254 H208 V332 H86 Z",
  "M116 356 H176 V402 H116 Z",
  "M234 348 H262 V402 H234 Z",
  "M70 25 H88 V119 H70 Z",
  "M78.5 119 V158",
];

function FrontFace({ p, begin }: { p: string; begin: string }) {
  const panel = `url(#${p}-panel)`;
  const frame = `url(#${p}-frame)`;
  const glow = `url(#${p}-glow)`;
  const anim = { dur: "5s", begin, repeatCount: "indefinite" } as const;

  return (
    <g>
      <Wire paths={FRONT_WIRE} />

      {/* ---------- Đèn tháp (lắp cuối, thả từ trên xuống) ---------- */}
      <Part d={1.25} y={-90}>
        <rect x="76" y="118" width="5" height="40" fill="#b9c1da" />
        <rect x="66" y="156" width="25" height="7" rx="1.5" fill="#262b40" />
        <rect x="70" y="25" width="18" height="6" rx="2" fill="#dfe2ee" />
        <rect x="70" y="31" width="18" height="26" fill="#4a1c22" />
        <rect x="70" y="57" width="18" height="26" fill="#4d3416" />
        <rect x="70" y="83" width="18" height="26" fill="#173d24" />
        <g className="lm-power">
          <rect className="lm-tower-r" x="70" y="31" width="18" height="26" fill="#ff4a4a" filter={glow} />
          <rect className="lm-tower-y" x="70" y="57" width="18" height="26" fill="#ffb02e" filter={glow} />
          <rect className="lm-tower-g" x="70" y="83" width="18" height="26" fill="#39e07a" filter={glow} />
        </g>
        <rect x="73" y="31" width="3" height="78" fill="#fff" opacity=".25" />
        <rect x="70" y="109" width="18" height="10" rx="1" fill="#c7ccdb" />
      </Part>

      {/* ---------- Khung tủ dưới (nâng từ dưới lên) ---------- */}
      <Part d={0.12} y={70}>
        <rect x="60" y="440" width="200" height="347" fill={frame} stroke={STROKE} />
        <rect x="64" y="444" width="192" height="333" fill="#a3acc8" />
        <rect x="154" y="450" width="12" height="327" fill={frame} stroke={STROKE} strokeWidth=".8" />
        <line x1="160" y1="452" x2="160" y2="775" stroke={STROKE} strokeWidth=".8" />
      </Part>

      {/* Cửa trái (trượt từ trái vào) */}
      <Part d={0.3} x={-55}>
        <rect x="72" y="456" width="82" height="154" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <rect x="72" y="624" width="82" height="150" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <Handle x={80} y={512} />
        <Handle x={80} y={678} />
        {[462, 598, 630, 760].map((y) => (
          <rect key={y} x="150" y={y} width="6" height="7" fill="#5d6785" />
        ))}
      </Part>

      {/* Cửa phải (trượt từ phải vào) */}
      <Part d={0.4} x={55}>
        <rect x="166" y="456" width="82" height="78" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <rect x="166" y="548" width="82" height="226" fill={panel} stroke={STROKE} strokeWidth=".8" />
      </Part>

      {/* Thanh ngang, ray đế, ốc vít */}
      <Part d={0.5} y={24}>
        <rect x="64" y="612" width="94" height="10" fill={frame} stroke={STROKE} strokeWidth=".6" />
        <rect x="162" y="536" width="94" height="10" fill={frame} stroke={STROKE} strokeWidth=".6" />
        {[
          [158, 466],
          [244, 466],
          [244, 524],
          [158, 556],
          [244, 556],
          [244, 764],
          [76, 618],
          [148, 618],
        ].map(([x, y]) => (
          <Screw key={`${x}-${y}`} x={x} y={y} />
        ))}
        <rect x="60" y="775" width="200" height="12" fill="#8792b1" stroke={STROKE} />
      </Part>

      {/* Bàn đặt phôi */}
      <Part d={0.58} y={-50}>
        <rect x="60" y="428" width="200" height="12" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <rect x="104" y="431" width="7" height="5" fill="#d8c437" />
        <rect x="113" y="431" width="7" height="5" fill="#3fbf6a" />
        <rect x="132" y="431" width="6" height="5" fill="#2a2f45" />
        <rect x="168" y="431" width="6" height="5" fill="#3fbf6a" />
        <rect x="178" y="431" width="6" height="5" fill="#2a2f45" />
      </Part>

      {/* ---------- Thân trên (hạ từ trên xuống) ---------- */}
      <Part d={0.7} y={-150}>
        <rect x="62" y="163" width="172" height="265" fill={panel} stroke={STROKE} />
      </Part>
      <Weld x={62} y={427} w={172} d={1.45} />

      {/* Cửa kính trên */}
      <Part d={0.95} y={-60}>
        <rect x="78" y="176" width="138" height="80" rx="5" fill="#a6acdc" stroke={STROKE} strokeWidth=".8" />
        <rect x="82" y="180" width="130" height="72" rx="3" fill={`url(#${p}-glass)`} />
        <g clipPath={`url(#${p}-clipGlass)`}>
          <polygon className="lm-sweep" points="70,180 100,180 70,252 40,252" fill="#fff" opacity=".35" />
        </g>
      </Part>

      {/* Tai đỡ + màn hình cảm ứng (nhô ra từ phía trước) */}
      <Part d={1.05} y={45}>
        <rect x="56" y="258" width="30" height="46" fill="#c4c9dc" stroke={STROKE} strokeWidth=".8" />
        <rect x="208" y="258" width="30" height="46" fill="#c4c9dc" stroke={STROKE} strokeWidth=".8" />
        <rect x="86" y="254" width="122" height="78" rx="3" fill="#20253a" />
        <g className="lm-power">
          <rect x="90" y="258" width="114" height="70" rx="2" fill={`url(#${p}-screen)`} />
          <rect x="98" y="266" width="38" height="4" rx="1" fill="#fff" opacity=".85" />
          <rect x="98" y="274" width="60" height="3" rx="1" fill="#fff" opacity=".35" />
          <circle className="lm-btn" cx="194" cy="268" r="3" fill="#39e07a" />
          <polyline
            points="98,302 108,296 118,299 128,290 138,293 148,286 158,291 168,283 178,288 188,282 196,285"
            fill="none"
            stroke="#a8d4ff"
            strokeWidth="1.2"
            opacity=".85"
          />
          <rect x="98" y="314" width="98" height="4" rx="2" fill="#fff" opacity=".18" />
          <rect x="98" y="314" width="0" height="4" rx="2" fill="#ffb066">
            <animate attributeName="width" values="0;98;98" keyTimes="0;0.72;1" {...anim} />
          </rect>
          <g clipPath={`url(#${p}-clipScreen)`}>
            <rect className="lm-sheen" x="90" y="258" width="34" height="70" fill={`url(#${p}-sheen)`} />
          </g>
        </g>
      </Part>

      {/* Thanh nhôm 2 bên + panel giữa + cửa sổ khắc */}
      <Part d={0.85} y={40}>
        <rect x="66" y="320" width="12" height="108" fill={frame} stroke={STROKE} strokeWidth=".8" />
        <rect x="216" y="320" width="12" height="108" fill={frame} stroke={STROKE} strokeWidth=".8" />
        <line x1="72" y1="322" x2="72" y2="426" stroke={STROKE} strokeWidth=".7" />
        <line x1="222" y1="322" x2="222" y2="426" stroke={STROKE} strokeWidth=".7" />
        <rect x="80" y="332" width="134" height="96" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <rect x="116" y="356" width="60" height="46" rx="5" fill="#a6acdc" stroke={STROKE} strokeWidth=".8" />
        <rect x="119" y="359" width="54" height="40" rx="3" fill={`url(#${p}-glassDark)`} />
        <g className="lm-power">
          <Laser p={p} begin={begin} />
        </g>
        <rect x="119" y="359" width="54" height="12" rx="3" fill="#fff" opacity=".08" />
        {[
          [70, 170],
          [226, 170],
          [70, 312],
          [226, 312],
          [92, 340],
          [146, 340],
          [202, 340],
          [92, 418],
          [146, 418],
          [202, 418],
          [104, 368],
          [188, 368],
          [104, 392],
          [188, 392],
        ].map(([x, y]) => (
          <Screw key={`${x}-${y}`} x={x} y={y} />
        ))}
      </Part>

      {/* Hộp điều khiển (gắn từ bên phải) */}
      <Part d={1.15} x={60}>
        <rect x="234" y="348" width="28" height="54" rx="3" fill={`url(#${p}-beige)`} stroke="#a8927a" />
        <circle cx="248" cy="366" r="4.6" fill="#1e7a3f" stroke="#555" strokeWidth=".6" />
        <g className="lm-power">
          <circle className="lm-btn" cx="248" cy="366" r="3.2" fill="#46f08a" filter={glow} />
        </g>
        <circle cx="248" cy="385" r="4.6" fill="#c62828" stroke="#555" strokeWidth=".6" />
        <circle cx="247" cy="384" r="1.4" fill="#fff" opacity=".4" />
        <rect x="236" y="404" width="24" height="24" rx="2" fill={panel} stroke={STROKE} strokeWidth=".8" />
        <rect x="242" y="409" width="12" height="14" rx="2" fill="#2a2f45" />
      </Part>

      {/* Bánh xe trước (lắp đầu tiên) */}
      <Part d={0} y={40}>
        <Caster x={76} y={787} />
        <Caster x={244} y={787} />
      </Part>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  3 góc nhìn – cùng chiều cao viewBox (850) nên hiển thị cao bằng    */
/*  nhau, lấy góc chính diện làm chuẩn                                  */
/* ------------------------------------------------------------------ */
const svgBase = { xmlns: "http://www.w3.org/2000/svg", role: "presentation" } as const;

/** Góc 1: chính diện */
function ViewFront() {
  const p = "lmA";
  return (
    <svg {...svgBase} viewBox="40 0 240 850">
      <Defs p={p} />
      <Part d={0}>
        <ellipse cx="160" cy="830" rx="118" ry="12" fill={`url(#${p}-shadow)`} />
      </Part>
      <FrontFace p={p} begin="0s" />
    </svg>
  );
}

/** Góc 2: 3/4 bên phải – đối xứng gương với góc 3 (cùng độ sâu & góc xoay) */
function ViewRight() {
  const p = "lmB";
  // Vector chiều sâu (+0.92, -0.16) – đối xứng với góc 3 (-0.92, -0.16), độ sâu 160
  const shear = "matrix(0.92 -0.16 0 1 ";
  return (
    <svg {...svgBase} viewBox="45 20 380 850">
      <Defs p={p} />
      <Part d={0}>
        <ellipse cx="235" cy="846" rx="175" ry="14" fill={`url(#${p}-shadow)`} />
      </Part>
      <Wire paths={["M62 183 L209 157 L381 157 L234 183", "M234 183 L381 157 L381 422 L234 448 Z", "M260 448 L407 422 L407 781 L260 807 Z"]} />

      {/* Nắp trên (đậy sau cùng) */}
      <Part d={1} y={-110}>
        <polygon points="62,183 234,183 381,157 209,157" fill={`url(#${p}-top)`} stroke={STROKE} />
      </Part>

      {/* Gờ trên tủ dưới (phần tủ rộng hơn thân trên) */}
      <Part d={0.58} y={-50}>
        <polygon points="234,448 260,448 407,422 381,422" fill={`url(#${p}-top)`} stroke={STROKE} strokeWidth=".8" />
      </Part>

      {/* Hông thân trên */}
      <Part d={0.78} x={90} y={-20}>
      <g transform={`${shear}234 0)`}>
        <rect x="0" y="183" width="160" height="265" fill={`url(#${p}-side)`} stroke={STROKE} />
        <rect x="0" y="183" width="8" height="265" fill={`url(#${p}-frame)`} />
        <rect x="152" y="183" width="8" height="265" fill={`url(#${p}-frame)`} />
        <rect x="0" y="183" width="160" height="7" fill={`url(#${p}-frame)`} />
        <Screw x={18} y={198} />
        <Screw x={142} y={198} />
        <Screw x={18} y={436} />
        <Screw x={142} y={436} />
      </g>
      </Part>

      {/* Hông tủ dưới – 1 cửa đóng, cùng màu các cửa khác */}
      <Part d={0.22} x={90} y={-20}>
      <g transform={`${shear}260 0)`}>
        <rect x="0" y="448" width="160" height="359" fill={`url(#${p}-frame)`} stroke={STROKE} />
        <rect x="10" y="462" width="140" height="331" fill={`url(#${p}-panel)`} stroke={STROKE} strokeWidth=".8" />
        <rect x="10" y="462" width="140" height="331" fill="#1d2440" opacity=".1" />
        <rect x="0" y="448" width="160" height="12" fill={`url(#${p}-frame)`} />
        <rect x="0" y="448" width="8" height="359" fill={`url(#${p}-frame)`} />
        <rect x="152" y="448" width="8" height="359" fill={`url(#${p}-frame)`} />
        <Handle x={118} y={608} />
        {[478, 766].map((y) => (
          <rect key={y} x="10" y={y} width="4" height="10" fill="#5d6785" />
        ))}
        <Screw x={22} y={472} />
        <Screw x={138} y={472} />
        <Screw x={22} y={783} />
        <Screw x={138} y={783} />
        <rect x="0" y="795" width="160" height="12" fill="#8792b1" />
      </g>
      </Part>
      <Part d={0} y={40}>
        <Caster x={407} y={781} s={0.85} />
      </Part>

      <g transform="translate(0 20)">
        <FrontFace p={p} begin="-1.7s" />
      </g>
    </svg>
  );
}

/** Góc 3: 3/4 bên trái – vách hông màu trắng như các cửa, có 2 quạt, cửa trước đóng */
function ViewLeft() {
  const p = "lmC";
  const shear = "matrix(-0.92 -0.16 0 1 ";
  return (
    <svg {...svgBase} viewBox="45 20 380 850">
      <Defs p={p} />
      <Part d={0}>
        <ellipse cx="235" cy="846" rx="175" ry="14" fill={`url(#${p}-shadow)`} />
      </Part>
      <Wire paths={["M384 183 L237 157 L65 157 L212 183", "M212 183 L65 157 L65 424 L212 450 Z", "M210 450 L63 424 L63 781 L210 807 Z"]} />

      {/* Nắp trên (đậy sau cùng) */}
      <Part d={1} y={-110}>
        <polygon points="212,183 384,183 237,157 65,157" fill={`url(#${p}-top)`} stroke={STROKE} />
      </Part>

      {/* Hông thân trên – cùng màu trắng các cửa */}
      <Part d={0.78} x={-90} y={-20}>
      <g transform={`${shear}212 0)`}>
        <rect x="0" y="183" width="160" height="267" fill={`url(#${p}-panel)`} stroke={STROKE} />
        <rect x="0" y="183" width="160" height="267" fill="#1d2440" opacity=".1" />
        <rect x="0" y="183" width="8" height="267" fill={`url(#${p}-frame)`} />
        <rect x="152" y="183" width="8" height="267" fill={`url(#${p}-frame)`} />
        <rect x="0" y="183" width="160" height="7" fill={`url(#${p}-frame)`} />
      </g>
      </Part>

      {/* Hông tủ dưới – cùng màu trắng các cửa, giữ 2 quạt */}
      <Part d={0.22} x={-90} y={-20}>
      <g transform={`${shear}210 0)`}>
        <rect x="0" y="450" width="160" height="357" fill={`url(#${p}-panel)`} stroke={STROKE} />
        <rect x="0" y="450" width="160" height="357" fill="#1d2440" opacity=".1" />
        <rect x="0" y="450" width="8" height="357" fill={`url(#${p}-frame)`} />
        <rect x="152" y="450" width="8" height="357" fill={`url(#${p}-frame)`} />
        <rect x="0" y="450" width="160" height="10" fill={`url(#${p}-frame)`} />
        <rect x="0" y="625" width="160" height="10" fill={`url(#${p}-frame)`} />
        <rect x="0" y="795" width="160" height="12" fill="#8792b1" />
        <Fan cx={112} cy={540} r={18} />
        <Fan cx={112} cy={712} r={18} />
      </g>
      </Part>
      <Part d={0} y={40}>
        <Caster x={63} y={781} s={0.85} />
      </Part>

      <g transform="translate(150 20)">
        <FrontFace p={p} begin="-3.3s" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  2 người đứng cạnh máy giữa – phong cách ký họa nét thô             */
/*  Dùng chung hệ tọa độ với ViewFront nên tay đặt đúng lên mép bàn máy */
/* ------------------------------------------------------------------ */
const INK = "#dfe6f5"; // nét viền sáng (phấn trắng trên nền tối)
const FOLD = "#6f7da0"; // nếp áo
const FACE_INK = "#3b2b22"; // nét mặt
const SKIN = "#e2b591";
const JACKET = "#10131d";
const PANTS = "#0b0d14";
const SHOE = "#05060a";

type Tone = "ink" | "fold" | "face" | "brass";
const TONE: Record<Tone, string> = { ink: INK, fold: FOLD, face: FACE_INK, brass: "#d6b880" };

/** Một nét vẽ: tự "vẽ ra" khi xuất hiện (pathLength = 1), có fill thì tô màu sau */
function Ink({ d, fill, tone = "ink", w }: { d: string; fill?: string; tone?: Tone; w?: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      fill={fill ?? "none"}
      stroke={TONE[tone]}
      strokeWidth={w ?? (tone === "ink" ? 1.9 : 1.3)}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={fill ? "lm-ink lm-fillable" : "lm-ink"}
    />
  );
}

/** Nét phác thứ hai lệch nhẹ – tạo cảm giác vẽ tay */
function Ghost({ paths }: { paths: string[] }) {
  return (
    <g transform="translate(1.6 -1.2)" opacity=".38">
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} fill="none" stroke={INK} strokeWidth=".8" strokeLinecap="round" className="lm-ink" />
      ))}
    </g>
  );
}

/* ---------- Người bên trái: cao, thanh mảnh, đeo kính, vẫy tay chào mỗi 6s ---------- */
const L = {
  pants:
    "M -91 520 L -23 520 L -26 600 C -26 680 -24 745 -23 795 L -43 795 C -46 745 -50 680 -52 600 L -57 548 L -62 600 C -62 680 -63 745 -64 795 L -84 795 C -86 745 -88 680 -88 600 Z",
  shoeA: "M -86 792 L -63 792 C -58 799 -54 804 -50 809 C -50 812 -52 813 -56 813 L -88 813 C -93 811 -91 799 -86 792 Z",
  shoeB: "M -44 792 L -22 792 C -15 799 -9 804 -5 809 C -5 812 -7 813 -11 813 L -46 813 C -50 811 -49 799 -44 792 Z",
  neck: "M -64 304 L -63 326 L -48 326 L -47 304 Z",
  jacket:
    "M -100 338 C -96 328 -84 324 -70 323 L -42 323 C -28 324 -16 328 -12 338 L -15 420 C -17 460 -19 500 -22 530 L -92 530 C -95 500 -97 460 -97 420 Z",
  shirt: "M -66 324 L -56 362 L -46 324 Z",
  // Tay vẫy – vẽ ở tư thế buông xuôi, xoay quanh vai (-100,342) và khuỷu (-103,432)
  upperArm: "M -109 338 C -113 368 -113 400 -112 434 L -94 436 C -93 404 -91 372 -88 344 Z",
  foreArm: "M -111 428 C -111 455 -109 480 -107 500 L -93 500 C -94 480 -95 455 -95 428 Z",
  waveHand:
    "M -107 499 C -109 508 -108 518 -104 524 C -101 527 -97 526 -95 522 C -93 515 -93 506 -94 499 Z",
  restArm:
    "M -22 336 C -10 340 -2 368 8 406 L 14 426 L 60 418 L 62 433 L 16 447 C 6 449 0 444 -2 436 C -10 410 -18 384 -27 358 Z",
  hand: "M 58 418 C 66 413 78 413 86 418 C 91 422 90 429 84 431 L 60 434 Z",
  face: "M -78 272 C -78 252 -66 245 -55 245 C -42 245 -33 253 -33 272 C -33 290 -40 304 -50 310 C -54 312 -58 312 -62 310 C -72 304 -78 290 -78 272 Z",
  ear: "M -77 268 C -86 266 -87 286 -77 290 Z",
  hair: "M -80 278 C -86 252 -74 234 -54 233 C -36 232 -26 244 -29 262 C -33 256 -41 251 -50 253 C -61 255 -70 253 -74 262 C -77 267 -78 273 -80 278 Z",
};

function PersonLeft() {
  return (
    <g className="lm-person" style={{ "--pd": "3.1s" } as CSSProperties}>
      <ellipse className="lm-fade" cx="-55" cy="815" rx="52" ry="6" fill="url(#lmP-shadow)" />

      <Ink d={L.pants} fill={PANTS} />
      <Ink d="M -57 548 L -57 530" tone="fold" />
      <Ink d={L.shoeA} fill={SHOE} />
      <Ink d={L.shoeB} fill={SHOE} />
      <Ink d="M -86 807 L -55 807" tone="fold" />
      <Ink d="M -44 807 L -10 807" tone="fold" />
      <Ink d={L.neck} fill={SKIN} w={1.4} />

      {/* Thân áo – thở nhẹ */}
      <g className="lm-breath">
        <Ink d={L.jacket} fill={JACKET} />
        <Ink d={L.shirt} fill="#272c3c" w={1.2} />
        <Ink d="M -66 324 C -64 340 -60 352 -56 372 L -60 420" />
        <Ink d="M -46 324 C -48 340 -52 352 -56 372" />
        <Ink d="M -56 372 L -57 526" tone="fold" />
        <Ink d="M -88 470 L -70 468" tone="fold" />
        <Ink d="M -30 400 C -28 430 -27 460 -26 500" tone="fold" />
      </g>

      {/* Tay trái: buông tự nhiên, cứ mỗi 6 giây giơ lên vẫy chào */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 -100 342;35 -100 342;35 -100 342;0 -100 342;0 -100 342"
          keyTimes="0;0.08;0.33;0.42;1"
          calcMode="spline"
          keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1"
          dur="6s"
          begin="5.2s"
          repeatCount="indefinite"
        />
        <Ink d={L.upperArm} fill={JACKET} />
        <Ink d="M -110 428 C -106 431 -99 432 -94 430" tone="fold" />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 -103 432;135 -103 432;112 -103 432;152 -103 432;112 -103 432;152 -103 432;122 -103 432;135 -103 432;0 -103 432;0 -103 432"
            keyTimes="0;0.08;0.12;0.16;0.2;0.24;0.28;0.33;0.42;1"
            calcMode="spline"
            keySplines=".4 0 .2 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.4 0 .2 1;.4 0 .2 1"
            dur="6s"
            begin="5.2s"
            repeatCount="indefinite"
          />
          <Ink d={L.foreArm} fill={JACKET} />
          <Ink d="M -107 495 L -93 495" tone="fold" />
          <Ink d={L.waveHand} fill={SKIN} w={1.5} />
          <Ink d="M -94 503 C -90 507 -90 512 -93 514" tone="face" w={1} />
          <Ink d="M -103 514 L -103 523" tone="face" w={1} />
          <Ink d="M -99 514 L -99 524" tone="face" w={1} />
        </g>
      </g>

      {/* Tay phải khoác lên bàn máy */}
      <Ink d={L.restArm} fill={JACKET} />
      <Ink d="M 4 420 C 6 428 9 434 13 438" tone="fold" />
      <Ink d="M 50 420 L 56 419 L 57 434 L 51 435 Z" fill="#d6b880" tone="brass" w={1} />
      <Ink d={L.hand} fill={SKIN} w={1.5} />
      <Ink d="M 70 425 L 84 424" tone="face" w={1} />
      <Ink d="M 70 429 L 83 428" tone="face" w={1} />

      {/* Đầu – nghiêng nhẹ, nhìn về phía máy */}
      <g className="lm-head">
        <Ink d={L.ear} fill={SKIN} w={1.4} />
        <Ink d={L.face} fill={SKIN} />
        <Ink d={L.hair} fill="#17110d" />
        <Ink d="M -70 240 C -60 236 -46 237 -36 245" tone="fold" />
        <Ink d="M -66 246 C -56 242 -46 243 -38 250" tone="fold" />
        <Ink d="M -68 272 L -58 271" tone="face" w={1.6} />
        <Ink d="M -49 271 L -39 272" tone="face" w={1.6} />
        <g className="lm-eyes">
          <g className="lm-glance">
            <ellipse className="lm-fade" cx="-63" cy="279" rx="2.4" ry="1.8" fill="#1a1410" />
            <ellipse className="lm-fade" cx="-44" cy="279" rx="2.4" ry="1.8" fill="#1a1410" />
          </g>
        </g>
        <Ink d="M -52 280 C -51 285 -49 290 -50 292 L -54 293" tone="face" w={1.1} />
        {/* Kính */}
        <Ink d="M -69 274 L -57 274 Q -56 274 -56 275 L -56 283 Q -56 285 -58 285 L -68 285 Q -70 285 -70 283 L -70 275 Q -70 274 -69 274 Z" tone="face" w={1.3} />
        <Ink d="M -50 274 L -38 274 Q -37 274 -37 275 L -37 283 Q -37 285 -39 285 L -49 285 Q -51 285 -51 283 L -51 275 Q -51 274 -50 274 Z" tone="face" w={1.3} />
        <Ink d="M -56 277 C -54 275.5 -52 275.5 -51 277" tone="face" w={1.1} />
        <Ink d="M -70 276 L -77 273" tone="face" w={1.1} />
        <Ink d="M -60 300 Q -54 304 -47 299" tone="face" w={1.3} />
      </g>

      <Ghost paths={[L.pants, L.jacket, L.restArm, L.face, L.hair]} />
    </g>
  );
}

/* ---------- Người bên phải: đầy đặn, đeo kính, cầm máy tính bảng ---------- */
const R = {
  pants:
    "M 322 520 L 424 520 L 420 600 C 420 680 418 745 416 795 L 386 795 C 384 745 380 680 378 610 L 373 562 L 368 610 C 366 680 362 745 360 795 L 330 795 C 328 745 326 680 326 600 Z",
  shoeA: "M 332 792 L 358 792 C 361 800 360 806 357 813 L 318 813 C 312 812 313 800 332 792 Z",
  shoeB: "M 388 792 L 414 792 C 417 800 417 806 415 813 L 376 813 C 370 812 371 800 388 792 Z",
  neck: "M 361 308 L 360 328 L 385 328 L 384 308 Z",
  jacket:
    "M 318 342 C 322 330 336 326 352 325 L 392 325 C 410 326 424 330 428 342 C 436 380 444 430 441 470 C 439 496 433 514 427 530 L 319 530 C 312 514 306 496 304 470 C 302 430 310 380 318 342 Z",
  shirt: "M 360 326 L 372 354 L 384 326 Z",
  restArm:
    "M 326 340 C 314 344 306 370 300 404 L 294 426 L 268 421 L 266 436 L 306 444 C 314 442 316 434 314 420 C 318 400 324 378 332 358 Z",
  hand: "M 268 419 C 260 415 248 416 242 421 C 237 426 241 432 248 434 L 268 437 Z",
  freeArm: "M 424 338 C 438 344 447 380 449 420 L 451 466 L 432 470 L 430 420 C 428 392 424 370 418 352 Z",
  tablet: "M 439 448 L 463 448 Q 466 448 466 451 L 466 487 Q 466 490 463 490 L 439 490 Q 436 490 436 487 L 436 451 Q 436 448 439 448 Z",
  hand2: "M 430 466 C 428 474 432 482 440 484 C 446 484 448 478 446 470 L 432 464 Z",
  face: "M 346 276 C 346 254 358 246 372 246 C 388 246 399 255 399 276 C 399 294 392 308 380 314 C 375 316 369 316 364 314 C 352 308 346 294 346 276 Z",
  ear: "M 398 270 C 407 268 408 288 398 291 Z",
  hair: "M 344 278 C 339 254 353 237 373 237 C 393 237 405 251 402 274 C 398 264 392 258 382 257 C 370 256 358 258 350 266 C 347 270 346 274 344 278 Z",
};

function PersonRight() {
  return (
    <g className="lm-person" style={{ "--pd": "3.45s" } as CSSProperties}>
      <ellipse className="lm-fade" cx="368" cy="815" rx="64" ry="7" fill="url(#lmP-shadow)" />

      <Ink d={R.pants} fill={PANTS} />
      <Ink d="M 373 562 L 373 532" tone="fold" />
      <Ink d={R.shoeA} fill={SHOE} />
      <Ink d={R.shoeB} fill={SHOE} />
      <Ink d="M 316 807 L 358 807" tone="fold" />
      <Ink d="M 373 807 L 416 807" tone="fold" />
      <Ink d={R.neck} fill={SKIN} w={1.4} />

      <g className="lm-breath lm-breath-b">
        <Ink d={R.jacket} fill={JACKET} />
        <Ink d={R.shirt} fill="#1d2232" w={1.2} />
        <Ink d="M 352 325 L 360 342 L 372 354" />
        <Ink d="M 392 325 L 384 342 L 372 354" />
        <Ink d="M 372 354 C 373 420 373 480 372 528" tone="fold" />
        <Ink d="M 316 470 C 340 488 404 488 430 470" tone="fold" />
        <Ink d="M 386 372 L 410 370" tone="fold" />
        <Ink d="M 398 360 L 398 372" tone="brass" w={2} />
      </g>

      {/* Tay phải cầm máy tính bảng */}
      <Ink d={R.freeArm} fill={JACKET} />
      <g transform="rotate(8 452 470)">
        <Ink d={R.tablet} fill="#1b2236" w={1.5} />
        <rect className="lm-fade" x="439" y="452" width="24" height="33" rx="1.5" fill="#2d5bff" />
        <rect className="lm-tab" x="439" y="452" width="24" height="33" rx="1.5" fill="#8fb0ff" />
        <rect className="lm-fade" x="442" y="456" width="12" height="2" fill="#fff" opacity=".8" />
        <rect className="lm-fade" x="442" y="461" width="17" height="1.5" fill="#fff" opacity=".45" />
        <rect className="lm-fade" x="442" y="478" width="18" height="2" rx="1" fill="#ffb066" />
      </g>
      <Ink d={R.hand2} fill={SKIN} w={1.5} />

      {/* Tay trái khoác lên bàn máy */}
      <Ink d={R.restArm} fill={JACKET} />
      <Ink d="M 312 412 C 310 422 306 430 300 434" tone="fold" />
      <Ink d="M 272 420 L 270 436" tone="fold" />
      <Ink d={R.hand} fill={SKIN} w={1.5} />
      <Ink d="M 245 425 L 260 424" tone="face" w={1} />
      <Ink d="M 246 429 L 259 429" tone="face" w={1} />

      {/* Đầu – gật nhẹ */}
      <g className="lm-head lm-head-b">
        <Ink d={R.ear} fill={SKIN} w={1.4} />
        <Ink d={R.face} fill={SKIN} />
        <Ink d={R.hair} fill="#2a211b" />
        <Ink d="M 356 246 C 366 242 384 242 394 250" tone="fold" />
        <Ink d="M 355 272 L 366 271" tone="face" w={1.6} />
        <Ink d="M 377 271 L 388 272" tone="face" w={1.6} />
        <g className="lm-eyes lm-eyes-b">
          <g className="lm-glance lm-glance-b">
            <ellipse className="lm-fade" cx="361" cy="282" rx="2.2" ry="1.7" fill="#1a1410" />
            <ellipse className="lm-fade" cx="382" cy="282" rx="2.2" ry="1.7" fill="#1a1410" />
          </g>
        </g>
        <Ink d="M 355 277 L 368 277 L 368 287 L 355 287 Z" tone="face" w={1.3} />
        <Ink d="M 376 277 L 389 277 L 389 287 L 376 287 Z" tone="face" w={1.3} />
        <Ink d="M 368 280 L 376 280" tone="face" w={1.2} />
        <Ink d="M 389 279 L 398 277" tone="face" w={1.2} />
        <Ink d="M 372 287 C 371 291 369 294 371 296 L 375 296" tone="face" w={1.1} />
        <Ink d="M 363 303 Q 372 309 381 303" tone="face" w={1.3} />
      </g>

      <Ghost paths={[R.pants, R.jacket, R.freeArm, R.restArm, R.face, R.hair]} />
    </g>
  );
}

/** Lớp chứa 2 người – chồng khít lên ViewFront (viewBox mở rộng 2 bên) */
function People() {
  return (
    <svg className="lm-people" xmlns="http://www.w3.org/2000/svg" viewBox="-170 0 660 850" role="presentation">
      <defs>
        {/* Nhiễu làm nét rung nhẹ như vẽ tay (line boil) */}
        <filter id="lmP-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed="2" result="n">
            <animate attributeName="seed" values="2;5;9;4" dur="1.2s" calcMode="discrete" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id="lmP-shadow">
          <stop offset="0" stopColor="#000" stopOpacity=".65" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#lmP-rough)">
        <PersonLeft />
        <PersonRight />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Hạt sáng bay lên (dữ liệu cố định để không lệch khi render SSR)    */
/* ------------------------------------------------------------------ */
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const dur = 14 + ((i * 7) % 10);
  return {
    left: `${(i * 37 + 11) % 100}%`,
    size: `${1.5 + (i % 3) * 0.8}px`,
    dur: `${dur}s`,
    delay: `${-((i * 2.3) % dur).toFixed(1)}s`,
  };
});

const RIPPLE_DELAYS = [0, -2.4, -4.8, -7.2, -9.6];

/* ------------------------------------------------------------------ */
/*  CSS                                                                */
/* ------------------------------------------------------------------ */
const CSS = `
.lm-bg{position:relative;isolation:isolate;overflow:hidden;min-height:100vh;min-height:100dvh;background:#04060b;color:#ece4d2}
.lm-layer{position:absolute;inset:0;pointer-events:none}
.lm-base{background:radial-gradient(ellipse 80% 70% at 50% 50%,#1c2845 0%,#111a2e 32%,#0a1020 62%,#04060b 100%)}
.lm-grid{inset:-48px;background-image:linear-gradient(rgba(150,172,220,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(150,172,220,.07) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 0%,transparent 65%);mask-image:radial-gradient(circle at 50% 50%,#000 0%,transparent 65%);animation:lm-grid 24s linear infinite}
.lm-core{position:absolute;left:50%;top:50%;width:80vmax;height:80vmax;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(92,128,210,.38) 0%,rgba(52,76,140,.18) 28%,transparent 62%);transform:translate(-50%,-50%);animation:lm-core 2.4s ease-in-out infinite}
.lm-ripple{position:absolute;left:50%;top:50%;width:170vmax;height:170vmax;border-radius:50%;pointer-events:none;background:radial-gradient(circle,transparent 56%,rgba(120,155,230,.16) 64%,rgba(214,184,128,.1) 67.5%,transparent 71%);transform:translate(-50%,-50%) scale(.03);opacity:0;animation:lm-ripple 12s cubic-bezier(.16,.6,.3,1) infinite;will-change:transform,opacity}
.lm-p{position:absolute;bottom:-12px;border-radius:50%;background:rgba(222,192,138,.85);box-shadow:0 0 6px rgba(222,192,138,.8);opacity:0;animation:lm-rise linear infinite}
.lm-vignette{z-index:2;background:radial-gradient(ellipse at 50% 50%,transparent 50%,rgba(0,0,0,.6) 100%)}

/* Sân khấu: dùng container query để co giãn theo vùng hiển thị (kể cả khi có sidebar) */
.lm-stage{position:absolute;inset:0;z-index:1;container-type:size;pointer-events:none}
.lm-stage-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(14px,4cqh,44px);padding:4cqh 4cqw}

/* Tiêu đề khắc laser */
.lm-title{margin:0;text-align:center}
.lm-title-wrap{position:relative;display:inline-block}
.lm-title-text{display:inline-block;white-space:nowrap;font-size:clamp(1.1rem,4.2cqw,3.25rem);font-weight:700;line-height:1.15;letter-spacing:.16em;padding-left:.16em;background:linear-gradient(100deg,#b8955a 0%,#f6e4b8 20%,#c9a467 38%,#8f6f3d 52%,#f6e4b8 74%,#b8955a 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 18px rgba(214,184,128,.28));clip-path:inset(-20% 100% -20% 0);animation:lm-engrave 1.8s cubic-bezier(.65,0,.35,1) .3s forwards,lm-shimmer 8s linear 2.2s infinite}
.lm-title-scan{position:absolute;top:-16%;bottom:-16%;left:0;right:0;pointer-events:none;animation:lm-scan 1.8s cubic-bezier(.65,0,.35,1) .3s both}
.lm-title-beam{position:absolute;left:-1px;top:0;bottom:0;width:2px;border-radius:2px;background:linear-gradient(to bottom,transparent,#ffd9a0 25%,#fff 50%,#ffd9a0 75%,transparent);box-shadow:0 0 12px 3px rgba(255,140,60,.7),0 0 32px 8px rgba(255,110,40,.3)}
.lm-title-rule{display:flex;align-items:center;gap:10px;width:min(60%,360px);margin:clamp(8px,1.6cqh,18px) auto 0;animation:lm-rule .9s cubic-bezier(.2,.75,.2,1) 1.9s both}
.lm-title-rule i{flex:1;height:1px;background:linear-gradient(90deg,transparent,#b8955a)}
.lm-title-rule i:last-child{background:linear-gradient(270deg,transparent,#b8955a)}
.lm-title-rule b{width:7px;height:7px;transform:rotate(45deg);border:1px solid #d6b880}

/* Hàng 3 máy: cao bằng nhau, chia đều khoảng cách tới 2 rìa */
.lm-row{--h:min(60cqh,62cqw,680px);position:relative;width:min(100%,1400px);display:flex;align-items:flex-end;justify-content:space-evenly}
.lm-row::after{content:"";position:absolute;left:0;right:0;bottom:-4%;height:14%;z-index:-1;background:radial-gradient(ellipse at center,rgba(110,145,235,.28),rgba(214,184,128,.06) 45%,transparent 70%);filter:blur(8px)}
.lm-m{position:relative}

/* Lắp ráp máy */
.lm-part{opacity:0;animation:lm-assemble .85s cubic-bezier(.3,1.3,.55,1) calc(var(--md,0s) + .5s + var(--ad,0s)) forwards}
.lm-wire{fill:none;stroke:#7fa3ff;stroke-width:1.1;stroke-dasharray:1 1;stroke-dashoffset:1;filter:drop-shadow(0 0 3px rgba(127,163,255,.8));animation:lm-draw 1s cubic-bezier(.45,0,.2,1) var(--md,0s) forwards,lm-wireout .8s ease calc(var(--md,0s) + 2.4s) forwards}
.lm-weld{opacity:0;transform-box:fill-box;transform-origin:left center;filter:drop-shadow(0 0 4px #ff8a3d) drop-shadow(0 0 10px rgba(255,120,40,.7));animation:lm-weld .75s ease-out calc(var(--md,0s) + .5s + var(--wd,0s)) forwards}
.lm-power{opacity:0;animation:lm-power 1s linear calc(var(--md,0s) + 2.65s) forwards}
.lm-m svg{display:block;height:var(--h);width:auto;overflow:visible}
.lm-side{z-index:1;filter:brightness(.86) saturate(.92)}
.lm-center{z-index:2;filter:drop-shadow(0 0 32px rgba(90,130,255,.25))}
.lm-float{position:relative;animation:lm-float 7s ease-in-out infinite;animation-delay:var(--f,0s)}
.lm-row--people{--h:min(60cqh,54cqw,680px);column-gap:calc(var(--h) * .24)}

/* 2 người: ký họa nét thô – tự vẽ nét, tô màu, rồi chuyển động nhẹ */
.lm-m svg.lm-people{position:absolute;top:0;left:calc(var(--h) * -210 / 850);height:var(--h);width:auto;overflow:visible;pointer-events:none}
.lm-ink{stroke-dasharray:1 1;stroke-dashoffset:1;animation:lm-draw 1.8s cubic-bezier(.45,0,.2,1) var(--pd,0s) forwards}
.lm-fillable{fill-opacity:0;animation:lm-draw 1.8s cubic-bezier(.45,0,.2,1) var(--pd,0s) forwards,lm-fillin .9s ease calc(var(--pd,0s) + 1.1s) forwards}
.lm-fade{opacity:0;animation:lm-fadein .8s ease calc(var(--pd,0s) + 1.3s) forwards}
.lm-breath{transform-box:fill-box;transform-origin:50% 100%;animation:lm-breath 4.2s ease-in-out infinite}
.lm-breath-b{animation-duration:3.6s;animation-delay:-1s}
.lm-head{transform-box:fill-box;transform-origin:50% 95%;animation:lm-head 7s ease-in-out infinite}
.lm-head-b{animation:lm-nod 5.5s ease-in-out infinite}
.lm-eyes{transform-box:fill-box;transform-origin:center;animation:lm-eye 5.2s ease-in-out infinite}
.lm-eyes-b{animation-delay:-2.3s}
.lm-glance{animation:lm-glance 9s ease-in-out infinite}
.lm-glance-b{animation-name:lm-glance-b;animation-delay:-3s}
.lm-tab{opacity:0;animation:lm-tab 2.2s ease-in-out calc(var(--pd,0s) + 2s) infinite}
.lm-content{position:relative;z-index:3}

/* Chi tiết máy */
.lm-tower-r{opacity:0}
.lm-tower-y{opacity:0;animation:lm-blink 4.8s steps(1,end) infinite}
.lm-tower-g,.lm-btn{animation:lm-on 2.4s ease-in-out infinite}
.lm-sheen{animation:lm-sheen 6s ease-in-out infinite}
.lm-sweep{animation:lm-sweep 9s ease-in-out infinite}
.lm-fan{transform-box:fill-box;transform-origin:center;animation:lm-spin .9s linear infinite}

@keyframes lm-grid{to{transform:translate3d(48px,48px,0)}}
@keyframes lm-core{0%,100%{transform:translate(-50%,-50%) scale(.92);opacity:.8}50%{transform:translate(-50%,-50%) scale(1.04);opacity:1}}
@keyframes lm-ripple{0%{transform:translate(-50%,-50%) scale(.03);opacity:0}8%{opacity:1}70%{opacity:.55}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
@keyframes lm-rise{0%{transform:translate3d(0,0,0);opacity:0}10%{opacity:.9}85%{opacity:.5}100%{transform:translate3d(24px,-105vh,0);opacity:0}}
@keyframes lm-engrave{to{clip-path:inset(-20% 0 -20% 0)}}
@keyframes lm-shimmer{from{background-position:0% 0}to{background-position:166.667% 0}}
@keyframes lm-scan{0%{transform:translateX(0);opacity:1}90%{opacity:1}100%{transform:translateX(100%);opacity:0}}
@keyframes lm-rule{from{opacity:0;transform:scaleX(.2)}to{opacity:1;transform:none}}
@keyframes lm-assemble{0%{opacity:0;transform:translate(var(--ax,0px),var(--ay,0px))}35%{opacity:1}100%{opacity:1;transform:translate(0,0)}}
@keyframes lm-wireout{to{opacity:0}}
@keyframes lm-weld{0%{opacity:1;transform:scaleX(0)}60%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
@keyframes lm-power{0%{opacity:0}10%{opacity:.85}18%{opacity:.1}32%{opacity:1}42%{opacity:.35}58%,100%{opacity:1}}
@keyframes lm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes lm-on{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes lm-blink{0%,100%{opacity:0}80%{opacity:1}88%{opacity:0}92%{opacity:1}96%{opacity:0}}
@keyframes lm-sheen{0%{transform:translateX(-50px)}55%,100%{transform:translateX(140px)}}
@keyframes lm-sweep{0%{transform:translateX(0)}50%,100%{transform:translateX(200px)}}
@keyframes lm-spin{to{transform:rotate(360deg)}}
@keyframes lm-draw{to{stroke-dashoffset:0}}
@keyframes lm-fillin{to{fill-opacity:1}}
@keyframes lm-fadein{to{opacity:1}}
@keyframes lm-breath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.012,1.016)}}
@keyframes lm-head{0%,100%{transform:rotate(0)}35%{transform:rotate(-2.4deg)}65%{transform:rotate(1.2deg)}}
@keyframes lm-nod{0%,100%{transform:rotate(0) translateY(0)}20%{transform:rotate(2deg) translateY(1px)}30%{transform:rotate(-.6deg)}45%{transform:rotate(1.6deg) translateY(1px)}55%{transform:rotate(0) translateY(0)}}
@keyframes lm-eye{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes lm-glance{0%,100%{transform:translateX(0)}40%,60%{transform:translateX(1.6px)}}
@keyframes lm-glance-b{0%,100%{transform:translateX(0)}40%,60%{transform:translateX(-1.6px)}}
@keyframes lm-tab{0%,100%{opacity:0}50%{opacity:.28}}

/* Màn hình hẹp: 2 máy bên nép sau máy giữa */
@container (max-width:640px){
  .lm-row,.lm-row--people{--h:min(56cqh,76cqw);justify-content:center;column-gap:0}
  .lm-m svg.lm-people{display:none}
  .lm-left{margin-right:-4cqw}
  .lm-right{margin-left:-4cqw}
}
@media (prefers-reduced-motion:reduce){
  .lm-bg *,.lm-bg *::after{animation:none!important}
  .lm-part,.lm-power{opacity:1}
  .lm-wire,.lm-weld{display:none}
  .lm-title-text{clip-path:none}
  .lm-ripple,.lm-p,.lm-laser,.lm-title-scan{display:none}
  .lm-ink{stroke-dashoffset:0}
  .lm-fillable{fill-opacity:1}
  .lm-fade{opacity:1}
  .lm-tower-g{opacity:1}
}
`;

/* ------------------------------------------------------------------ */
/*  Component chính                                                    */
/* ------------------------------------------------------------------ */
export default function BackgroundLaser({
  children,
  className = "",
  showMachines = true,
  showPeople = true,
  title = "NEW LASER MARKING",
}: BackgroundLaserProps) {
  return (
    <div className={`lm-bg ${className}`}>
      <style>{CSS}</style>

      <div className="lm-layer lm-base" aria-hidden />
      <div className="lm-layer lm-grid" aria-hidden />
      <div className="lm-core" aria-hidden />
      {RIPPLE_DELAYS.map((d) => (
        <div key={d} className="lm-ripple" style={{ animationDelay: `${d}s` }} aria-hidden />
      ))}

      <div className="lm-layer" aria-hidden>
        {PARTICLES.map((pt, i) => (
          <span
            key={i}
            className="lm-p"
            style={{
              left: pt.left,
              width: pt.size,
              height: pt.size,
              animationDuration: pt.dur,
              animationDelay: pt.delay,
            }}
          />
        ))}
      </div>

      {showMachines && (
        <div className="lm-stage">
          <div className="lm-stage-inner">
            {title && (
              <h1 className={`lm-title ${appFont.className}`}>
                <span className="lm-title-wrap">
                  <span className="lm-title-text">{title}</span>
                  <span className="lm-title-scan" aria-hidden>
                    <span className="lm-title-beam" />
                  </span>
                </span>
                <span className="lm-title-rule" aria-hidden>
                  <i />
                  <b />
                  <i />
                </span>
              </h1>
            )}

            <div className={`lm-row${showPeople ? " lm-row--people" : ""}`} aria-hidden>
              <div className="lm-m lm-side lm-left" style={{ "--md": "0.95s" } as CSSProperties}>
                <div className="lm-float" style={{ "--f": "-2.5s" } as CSSProperties}>
                  <ViewLeft />
                </div>
              </div>
              <div className="lm-m lm-center" style={{ "--md": "0.6s" } as CSSProperties}>
                <div className="lm-float">
                  <ViewFront />
                  {showPeople && <People />}
                </div>
              </div>
              <div className="lm-m lm-side lm-right" style={{ "--md": "1.3s" } as CSSProperties}>
                <div className="lm-float" style={{ "--f": "-4.5s" } as CSSProperties}>
                  <ViewRight />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lm-layer lm-vignette" aria-hidden />

      {children && <div className="lm-content">{children}</div>}
    </div>
  );
}