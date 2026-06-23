import type { CSSProperties, ReactNode } from 'react'

/**
 * Diagrama de ecosistema tipo "Orbiting Circles" (patrón Magic UI).
 * Crisopa en el centro; ChatGPT y Claude orbitan en el anillo interior
 * (las puertas hacia la IA) y los conectores en el exterior. La órbita es
 * 100% CSS (keyframe `orbit` en global.css), así que el componente se
 * renderiza estático: no necesita hidratación ni envía JS al cliente.
 */

type OrbitNode = {
  label: string
  node: ReactNode
}

interface OrbitRingProps {
  nodes: OrbitNode[]
  radius: string
  size: string
  duration: number
  reverse?: boolean
}

function OrbitRing({ nodes, radius, size, duration, reverse = false }: OrbitRingProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-primary-200/70"
        style={{
          width: `calc(${radius} * 2)`,
          height: `calc(${radius} * 2)`,
          marginLeft: `calc(${radius} * -1)`,
          marginTop: `calc(${radius} * -1)`,
        }}
      />
      {nodes.map((item, i) => {
        const angle = (360 / nodes.length) * i
        return (
          <div
            key={item.label}
            className="orbit-node absolute left-1/2 top-1/2"
            style={
              {
                '--angle': `${angle}deg`,
                '--radius': radius,
                '--duration': `${duration}s`,
                width: size,
                height: size,
                marginLeft: `calc(${size} / -2)`,
                marginTop: `calc(${size} / -2)`,
                animationDirection: reverse ? 'reverse' : 'normal',
              } as CSSProperties
            }
          >
            <span className="sr-only">{item.label}</span>
            {item.node}
          </div>
        )
      })}
    </>
  )
}

const connectorTile =
  'flex h-full w-full items-center justify-center rounded-[28%] bg-surface text-foreground/75 shadow-md shadow-primary-900/5 ring-1 ring-primary-100'

const Logo = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-1/2 w-1/2">
    <path d={d} />
  </svg>
)

// Conectores (anillo exterior) — logos en monocromo para no romper el esmeralda
const connectors: OrbitNode[] = [
  {
    label: 'Google Drive',
    node: (
      <div className={connectorTile}>
        <Logo d="M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574zm-4.76 1.73a789.828 789.861 0 0 0-3.63 6.319L0 15.868l1.89 3.298 1.885 3.297 3.62-6.335 3.618-6.33-1.88-3.287C8.1 4.704 7.255 3.22 7.25 3.214zm2.259 12.653-.203.348c-.114.198-.96 1.672-1.88 3.287a423.93 423.948 0 0 1-1.698 2.97c-.01.026 3.24.042 7.222.042h7.244l1.796-3.157c.992-1.734 1.85-3.23 1.906-3.323l.104-.167h-7.249z" />
      </div>
    ),
  },
  {
    label: 'Telegram',
    node: (
      <div className={connectorTile}>
        <Logo d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </div>
    ),
  },
  {
    label: 'Gmail',
    node: (
      <div className={connectorTile}>
        <Logo d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </div>
    ),
  },
  {
    label: 'Notion',
    node: (
      <div className={connectorTile}>
        <Logo d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </div>
    ),
  },
  {
    label: 'Google Calendar',
    node: (
      <div className={connectorTile}>
        <Logo d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z" />
      </div>
    ),
  },
  {
    label: 'Google Sheets',
    node: (
      <div className={connectorTile}>
        <Logo d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z" />
      </div>
    ),
  },
  {
    label: 'Registro oficial del MAPA',
    node: (
      <div className={connectorTile}>
        <span className="font-mono text-[clamp(7px,2.6cqw,11px)] font-bold tracking-tight text-foreground/70">
          MAPA
        </span>
      </div>
    ),
  },
  {
    label: 'Y más conectores',
    node: (
      <div className={connectorTile}>
        <span className="font-mono text-[clamp(8px,2.8cqw,12px)] font-semibold text-foreground/55">
          +más
        </span>
      </div>
    ),
  },
]

// IA (anillo interior): las dos "puertas" reales hacia Crisopa, en color de marca
const aiNodes: OrbitNode[] = [
  {
    label: 'ChatGPT',
    node: (
      <div className="flex h-full w-full items-center justify-center rounded-[26%] bg-[#0e1117] text-white shadow-lg shadow-gray-900/25 ring-1 ring-black/5">
        <Logo d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z" />
      </div>
    ),
  },
  {
    label: 'Claude',
    node: (
      <div className="flex h-full w-full items-center justify-center rounded-[26%] bg-[#d97757] text-white shadow-lg shadow-[#d97757]/30 ring-1 ring-black/5">
        <Logo d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.541Zm-.3712 10.2197 2.2914-5.9456 2.2914 5.9456Z" />
      </div>
    ),
  },
]

export default function OrbitingConnectors() {
  return (
    <div
      role="img"
      aria-label="Crisopa en el centro de tu ecosistema: hablas con ChatGPT o Claude y la IA conecta tu cuaderno con Google Drive, Gmail, Calendar, Notion, Telegram, el registro del MAPA y más herramientas."
      className="orbit-stage relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center"
    >
      {/* Glow del hub */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/20 blur-2xl"
        style={{ width: '34cqw', height: '34cqw' }}
      />

      {/* Conectores (exterior, sentido inverso) */}
      <OrbitRing nodes={connectors} radius="40cqw" size="min(48px,11cqw)" duration={46} reverse />

      {/* IA (interior) */}
      <OrbitRing nodes={aiNodes} radius="25cqw" size="min(56px,14cqw)" duration={32} />

      {/* Crisopa (hub central) */}
      <div
        className="relative z-10 flex items-center justify-center rounded-[28%] bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl shadow-primary-900/30 ring-1 ring-white/20"
        style={{ width: '22cqw', height: '22cqw' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-1/2 w-1/2"
        >
          <path d="M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z" />
          <path d="M11.99 22 14 12l7.822 3.184" />
          <path d="M14 12 8.47 2.302" />
        </svg>
      </div>
    </div>
  )
}
