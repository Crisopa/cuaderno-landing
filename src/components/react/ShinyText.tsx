import './ShinyText.css'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${disabled ? 'shiny-text--disabled' : ''} ${className}`}
      style={{ animationDuration: `${speed}s` }}
    >
      {text}
    </span>
  )
}
