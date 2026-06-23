import { useRef, useEffect } from 'react';
import './ShapeGrid.css';

// Hash deterministas en [0,1) a partir de un índice ENTERO ABSOLUTO de parcela.
// Como dependen del índice absoluto (no de la posición en pantalla), el dibujo
// es estable mientras la rejilla se desliza: una linde sigue siendo linde y una
// finca tintada sigue tintada aunque crucen el viewport.
const hash1 = n => {
  const x = Math.sin(n * 127.1 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};
const hash2 = (a, b) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ShapeGrid = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222',
  hoverTrailAmount = 0,
  // Catastro: lindes (bordes gruesos de finca) y parcelas ocupadas (tinte tenue).
  lindeColor = '#666',
  lindeWidth = 1.75,
  lindeChance = 0.34, // proporción de divisiones que son linde gruesa
  parcelFillColor = 'rgba(0,0,0,0.04)',
  parcelChance = 0.1, // proporción de parcelas con tinte de "finca ocupada"
  className = ''
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef(null); // parcela bajo el cursor, índice absoluto {x, y}
  const hoverAlpha = useRef(0); // opacidad de la parcela bajo el cursor
  const trail = useRef([]); // estela: cuadros congelados en pantalla {sx, sy, alpha}
  const lastMouse = useRef(null);
  const canvasRect = useRef(null);
  const prevTime = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Cacheamos el rect del canvas: getBoundingClientRect fuerza un reflow, así
    // que lo leemos solo al cambiar tamaño o al hacer scroll, no en cada frame.
    const updateRect = () => {
      canvasRect.current = canvas.getBoundingClientRect();
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      updateRect();
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateRect, { passive: true });
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // offsetX/offsetY ∈ [0, squareSize): posición visual de la rejilla.
      const colShift = Math.floor(gridOffset.current.x / squareSize);
      const rowShift = Math.floor(gridOffset.current.y / squareSize);
      const offsetX = gridOffset.current.x - colShift * squareSize;
      const offsetY = gridOffset.current.y - rowShift * squareSize;

      // Índice absoluto de la primera celda/línea visible (la que empieza una
      // celda antes del borde izq/sup, para cubrir la parcela parcialmente fuera).
      // Una línea en pantalla x = offsetX + i*squareSize tiene índice absoluto i-colShift.
      const startI = -1;

      // 1) Parcelas ocupadas: tinte tenue de fondo. Va lo primero, bajo todo lo demás.
      ctx.fillStyle = parcelFillColor;
      for (let i = startI, x = offsetX + startI * squareSize; x < canvas.width; i++, x += squareSize) {
        const col = i - colShift;
        for (let j = startI, y = offsetY + startI * squareSize; y < canvas.height; j++, y += squareSize) {
          const row = j - rowShift;
          if (hash2(col, row) < parcelChance) {
            ctx.fillRect(x, y, squareSize, squareSize);
          }
        }
      }

      // 2) Estela: cuadros congelados en su posición de pantalla. No siguen al campo,
      // se desvanecen donde estaban, así que la estela no se separa del cursor.
      for (const c of trail.current) {
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(c.sx, c.sy, squareSize, squareSize);
      }

      // 3) Parcela bajo el cursor: anclada a la rejilla (alineada y siempre bajo el
      // cursor). Su posición de pantalla es índiceAbsoluto*squareSize + gridOffset.
      if (hoveredSquare.current && hoverAlpha.current > 0.01) {
        const sx = hoveredSquare.current.x * squareSize + gridOffset.current.x;
        const sy = hoveredSquare.current.y * squareSize + gridOffset.current.y;
        ctx.globalAlpha = hoverAlpha.current;
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(sx, sy, squareSize, squareSize);
      }
      ctx.globalAlpha = 1;

      // 4) Líneas: dos pasadas (subdivisiones finas + lindes gruesas de finca).
      // Cada división se clasifica por su índice absoluto, así que las parcelas
      // mantienen su forma irregular al deslizarse y no parece papel de cuaderno.
      const thin = new Path2D();
      const linde = new Path2D();
      for (let i = startI, x = offsetX + startI * squareSize; x <= canvas.width; i++, x += squareSize) {
        const b = i - colShift; // índice absoluto de la división vertical
        const target = hash1(b) < lindeChance ? linde : thin;
        target.moveTo(x, 0);
        target.lineTo(x, canvas.height);
      }
      for (let j = startI, y = offsetY + startI * squareSize; y <= canvas.height; j++, y += squareSize) {
        // Desfasamos el hash de filas (+9973) para que lindes horizontales y
        // verticales no coincidan en el mismo patrón.
        const b = j - rowShift + 9973;
        const target = hash1(b) < lindeChance ? linde : thin;
        target.moveTo(0, y);
        target.lineTo(canvas.width, y);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = borderColor;
      ctx.stroke(thin);
      ctx.lineWidth = lindeWidth;
      ctx.strokeStyle = lindeColor;
      ctx.stroke(linde);
      ctx.lineWidth = 1;
    };

    const updateAnimation = now => {
      // Normalizamos por delta-time: avanzamos en función del tiempo transcurrido,
      // no por frame. Así el desplazamiento es uniforme a cualquier refresco de
      // pantalla (60/120/144 Hz) y no tartamudea si se cuela un frame largo.
      // Limitamos el salto a ~4 frames para no pegar un brinco tras cambiar de
      // pestaña (cuando rAF se pausa y el delta acumulado es enorme).
      const dt = prevTime.current == null ? 16.6667 : now - prevTime.current;
      prevTime.current = now;
      const frames = Math.min(dt / 16.6667, 4);
      const effectiveSpeed = Math.max(speed, 0.1) * frames;
      // Acumulamos el offset SIN envolverlo a un periodo: así cada parcela tiene
      // una identidad absoluta estable. Si lo envolviéramos, al cruzar el límite
      // del módulo toda la rejilla se reindexaba y la celda resaltada pegaba un
      // salto. Solo lo reenvolvemos a un múltiplo enorme del periodo para no
      // perder precisión en sesiones largas.
      const period = squareSize * 100000;

      switch (direction) {
        case 'right':
          gridOffset.current.x -= effectiveSpeed;
          break;
        case 'left':
          gridOffset.current.x += effectiveSpeed;
          break;
        case 'up':
          gridOffset.current.y += effectiveSpeed;
          break;
        case 'down':
          gridOffset.current.y -= effectiveSpeed;
          break;
        case 'diagonal':
          gridOffset.current.x -= effectiveSpeed;
          gridOffset.current.y -= effectiveSpeed;
          break;
        default:
          break;
      }
      if (Math.abs(gridOffset.current.x) > period) gridOffset.current.x %= period;
      if (Math.abs(gridOffset.current.y) > period) gridOffset.current.y %= period;

      // Recalculamos qué parcela está bajo el cursor en cada frame: como la rejilla
      // se desliza, la parcela bajo un cursor quieto cambia con el tiempo.
      updateHoverFromMouse();
      updateHighlights(frames);
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const updateHighlights = frames => {
      // Subida rápida (la parcela bajo el cursor se enciende ya, pegada al cursor)
      // y bajada más lenta (la estela se desvanece suave). Normalizado a delta-time.
      const attack = 1 - Math.pow(1 - 0.45, frames);
      const decay = 1 - Math.pow(1 - 0.2, frames);

      // La parcela bajo el cursor sube hacia 1; si no hay cursor, baja hacia 0.
      const target = hoveredSquare.current ? 1 : 0;
      const rate = target > hoverAlpha.current ? attack : decay;
      hoverAlpha.current += (target - hoverAlpha.current) * rate;

      // La estela congelada solo se desvanece; se descarta al volverse invisible.
      if (trail.current.length) {
        for (const c of trail.current) c.alpha += (0 - c.alpha) * decay;
        trail.current = trail.current.filter(c => c.alpha > 0.01);
      }
    };

    // Congela la parcela actualmente resaltada como cuadro de estela en su posición
    // de pantalla del momento, para que se desvanezca ahí sin seguir al campo.
    const freezeIntoTrail = () => {
      if (hoverTrailAmount <= 0 || !hoveredSquare.current || hoverAlpha.current <= 0.02) return;
      const sx = hoveredSquare.current.x * squareSize + gridOffset.current.x;
      const sy = hoveredSquare.current.y * squareSize + gridOffset.current.y;
      trail.current.unshift({ sx, sy, alpha: hoverAlpha.current });
      if (trail.current.length > hoverTrailAmount) trail.current.length = hoverTrailAmount;
    };

    const updateHoverFromMouse = () => {
      if (!lastMouse.current) return;

      const rect = canvasRect.current;
      if (!rect) return;
      const mouseX = lastMouse.current.clientX - rect.left;
      const mouseY = lastMouse.current.clientY - rect.top;

      // Si el cursor está fuera del área del canvas, no hay hover
      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
        return;
      }

      // Índice absoluto de la parcela: coherente con la posición usada al dibujar.
      const col = Math.floor((mouseX - gridOffset.current.x) / squareSize);
      const row = Math.floor((mouseY - gridOffset.current.y) / squareSize);

      if (
        !hoveredSquare.current ||
        hoveredSquare.current.x !== col ||
        hoveredSquare.current.y !== row
      ) {
        // Al cambiar de parcela, la saliente se congela como estela y la nueva
        // hereda el brillo (entra encendida, pegada al cursor) → sin lag ni saltos.
        freezeIntoTrail();
        hoveredSquare.current = { x: col, y: row };
      }
    };

    const handleMouseMove = event => {
      lastMouse.current = { clientX: event.clientX, clientY: event.clientY };
      updateHoverFromMouse();
    };

    const handleMouseLeave = () => {
      lastMouse.current = null;
      freezeIntoTrail();
      hoveredSquare.current = null;
    };

    // Escuchamos en window porque el canvas va de fondo (z-index negativo)
    // y no recibe los eventos de ratón que captura el contenido superpuesto.
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', updateRect);
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, hoverTrailAmount,
      lindeColor, lindeWidth, lindeChance, parcelFillColor, parcelChance]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`}></canvas>;
};

export default ShapeGrid;
