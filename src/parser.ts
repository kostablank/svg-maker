export type SvgShape = {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  r?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  filter?: 'shadow' | 'none';
  rotation?: number;
  strokeDasharray?: string;
  gradient?: { id: string; type: 'linear' | 'radial'; from: string; to: string } | null;
};

const colorMap: Record<string, string> = {
  красный: '#ef4444',
  синий: '#2563eb',
  зелёный: '#22c55e',
  green: '#22c55e',
  blue: '#2563eb',
  red: '#ef4444',
  жёлтый: '#facc15',
  yellow: '#facc15',
  чёрный: '#111827',
  black: '#111827',
  белый: '#ffffff',
  white: '#ffffff',
  оранжевый: '#f97316',
  orange: '#f97316',
  фиолетовый: '#8b5cf6',
  purple: '#8b5cf6',
  розовый: '#ec4899',
  pink: '#ec4899',
  серый: '#64748b',
  gray: '#64748b',
  grey: '#64748b',
};

const extractColor = (text: string) => {
  for (const [name, value] of Object.entries(colorMap)) {
    if (text.includes(name)) return value;
  }
  return '#4f46e5';
};

export function parsePromptToShapes(prompt: string): SvgShape[] {
  const normalized = prompt.toLowerCase();
  const shapes: SvgShape[] = [];

  const hasCircle = normalized.includes('круг') || normalized.includes('circle');
  const hasRect = normalized.includes('квадрат') || normalized.includes('прямоугольник') || normalized.includes('rectangle') || normalized.includes('rect');
  const hasLine = normalized.includes('линия') || normalized.includes('line');
  const hasText = normalized.includes('текст') || normalized.includes('text');
  const useOutline = normalized.includes('outline') || normalized.includes('обводка') || normalized.includes('outline') || normalized.includes('контур');
  const useGradient = normalized.includes('градиент') || normalized.includes('gradient');
  const useShadow = normalized.includes('тень') || normalized.includes('shadow') || normalized.includes('shadow');
  const isDashed = normalized.includes('пунктир') || normalized.includes('dashed');
  const fill = extractColor(normalized);

  const createGradient = (id: string, from = fill, to = '#0f172a') => ({
    id,
    type: 'linear' as const,
    from,
    to,
  });

  const buildBase = (shapeType: SvgShape['type']) => ({
    id: crypto.randomUUID(),
    type: shapeType,
    x: 180,
    y: 120,
    fill,
    stroke: '#111827',
    strokeWidth: useOutline ? 5 : 2,
    opacity: 1,
    filter: useShadow ? 'shadow' : 'none',
    strokeDasharray: isDashed ? '8 6' : undefined,
    rotation: 0,
    text: '',
    fontSize: 36,
  });

  if (hasCircle) {
    shapes.push({
      ...buildBase('circle'),
      x: 360,
      y: 260,
      r: 110,
      fill: useGradient ? `url(#grad-circle)` : fill,
      stroke: '#111827',
      gradient: useGradient ? createGradient('grad-circle', fill, '#0f172a') : null,
    });
  }

  if (hasRect) {
    shapes.push({
      ...buildBase('rect'),
      x: 150,
      y: 120,
      width: 220,
      height: 180,
      fill: useGradient ? `url(#grad-rect)` : '#60a5fa',
      stroke: '#111827',
      strokeWidth: useOutline ? 5 : 3,
      r: 20,
      gradient: useGradient ? createGradient('grad-rect', '#60a5fa', '#1d4ed8') : null,
    });
  }

  if (hasLine) {
    shapes.push({
      ...buildBase('line'),
      x: 120,
      y: 450,
      width: 500,
      height: 0,
      fill: '#111827',
      stroke: '#111827',
      strokeWidth: useOutline ? 6 : 5,
      filter: useShadow ? 'shadow' : 'none',
      strokeDasharray: isDashed ? '8 6' : undefined,
    });
  }

  if (hasText) {
    shapes.push({
      ...buildBase('text'),
      x: 250,
      y: 340,
      fill: '#111827',
      stroke: '#111827',
      strokeWidth: 0,
      text: 'SVG',
      fontSize: 52,
      filter: useShadow ? 'shadow' : 'none',
    });
  }

  if (!shapes.length) {
    shapes.push({
      id: crypto.randomUUID(),
      type: 'rect',
      x: 180,
      y: 120,
      width: 260,
      height: 180,
      fill: '#4f46e5',
      stroke: '#111827',
      strokeWidth: 3,
      opacity: 1,
      text: 'SVG',
      fontSize: 36,
      filter: 'none',
      rotation: 0,
      strokeDasharray: undefined,
      gradient: null,
    });
  }

  return shapes;
}

export function makePromptExamples() {
  return [
    'красный круг в центре, чёрная обводка 5px, тень',
    'синий квадрат слева, жёлтая линия справа, контур 3px',
    'зелёный прямоугольник с градиентом, тень, обводка 4px',
    'текст SVG в центре, белый фон, чёрная обводка',
  ];
}
