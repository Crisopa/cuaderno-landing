import { useRef, useEffect, useCallback, type ReactNode } from 'react'

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  extraScale?: number
  children?: ReactNode
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

export default function ClickSpark({
  sparkColor = '#107a57',
  sparkSize = 9,
  sparkRadius = 16,
  sparkCount = 8,
  duration = 420,
  easing = 'ease-out',
  extraScale = 1,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const animationId = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let resizeTimeout: ReturnType<typeof setTimeout>
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resize, 100)
    }
    window.addEventListener('resize', onResize)
    resize()

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t
        case 'ease-in':
          return t * t
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        default:
          return t * (2 - t)
      }
    },
    [easing]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) return false
        const progress = elapsed / duration
        const eased = easeFunc(progress)
        const distance = eased * sparkRadius * extraScale
        const lineLength = sparkSize * (1 - eased)
        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)
        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.globalAlpha = 1 - eased
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        return true
      })
      ctx.globalAlpha = 1
      animationId.current = requestAnimationFrame(draw)
    }
    animationId.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId.current)
  }, [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = performance.now()
      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      }))
      sparksRef.current.push(...newSparks)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [sparkCount])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  )
}
