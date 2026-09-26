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
  layer?: number;
};

export type StylePreset = 'minimal' | 'modern' | 'glass' | 'outline' | 'shadow';

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

const getPresetConfig = (preset: StylePreset) => {
  switch (preset) {
    case 'modern':
      return { strokeWidth: 3, filter: 'shadow' as const, opacity: 1, rotation: 0, dash: undefined };
    case 'glass':
      return { strokeWidth: 2, filter: 'shadow' as const, opacity: 0.9, rotation: 0, dash: undefined };
    case 'outline':
      return { strokeWidth: 5, filter: 'none' as const, opacity: 1, rotation: 0, dash: undefined };
    case 'shadow':
      return { strokeWidth: 3, filter: 'shadow' as const, opacity: 1, rotation: 0, dash: undefined };
    case 'minimal':
    default:
      return { strokeWidth: 2, filter: 'none' as const, opacity: 1, rotation: 0, dash: undefined };
  }
};

const resolvePosition = (normalized: string) => {
  if (normalized.includes('центр') || normalized.includes('center')) return { x: 360, y: 250 };
  if (normalized.includes('слева') || normalized.includes('left')) return { x: 180, y: 220 };
  if (normalized.includes('справа') || normalized.includes('right')) return { x: 520, y: 220 };
  if (normalized.includes('сверху') || normalized.includes('top')) return { x: 360, y: 140 };
  if (normalized.includes('снизу') || normalized.includes('bottom')) return { x: 360, y: 420 };
  return { x: 360, y: 260 };
};

export function parsePromptToShapes(prompt: string, preset: StylePreset = 'minimal'): SvgShape[] {
  const normalized = prompt.toLowerCase();
  const shapes: SvgShape[] = [];

  const hasCircle = normalized.includes('круг') || normalized.includes('circle');
  const hasRect = normalized.includes('квадрат') || normalized.includes('прямоугольник') || normalized.includes('rectangle') || normalized.includes('rect');
  const hasLine = normalized.includes('линия') || normalized.includes('line');
  const hasText = normalized.includes('текст') || normalized.includes('text');
  const useOutline = normalized.includes('outline') || normalized.includes('обводка') || normalized.includes('контур');
  const useGradient = normalized.includes('градиент') || normalized.includes('gradient');
  const useShadow = normalized.includes('тень') || normalized.includes('shadow') || preset === 'shadow';
  const isDashed = normalized.includes('пунктир') || normalized.includes('dashed');
  const fill = extractColor(normalized);
  const config = getPresetConfig(preset);

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
    strokeWidth: useOutline ? config.strokeWidth + 2 : config.strokeWidth,
    opacity: config.opacity,
    filter: useShadow ? 'shadow' : config.filter,
    strokeDasharray: isDashed ? '8 6' : config.dash,
    rotation: config.rotation,
    text: '',
    fontSize: 36,
    layer: 0,
  });

  const circlePosition = resolvePosition(normalized);
  if (hasCircle) {
    shapes.push({
      ...buildBase('circle'),
      x: circlePosition.x,
      y: circlePosition.y,
      r: 110,
      fill: useGradient ? `url(#grad-circle)` : fill,
      stroke: '#111827',
      gradient: useGradient ? createGradient('grad-circle', fill, '#0f172a') : null,
      layer: 2,
    });
  }

  const rectPosition = resolvePosition(normalized);
  if (hasRect) {
    shapes.push({
      ...buildBase('rect'),
      x: rectPosition.x - 120,
      y: rectPosition.y - 90,
      width: 240,
      height: 180,
      fill: useGradient ? `url(#grad-rect)` : '#60a5fa',
      stroke: '#111827',
      strokeWidth: useOutline ? config.strokeWidth + 2 : config.strokeWidth,
      r: 20,
      gradient: useGradient ? createGradient('grad-rect', '#60a5fa', '#1d4ed8') : null,
      layer: 1,
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
      filter: useShadow ? 'shadow' : config.filter,
      strokeDasharray: isDashed ? '8 6' : config.dash,
      layer: 3,
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
      filter: useShadow ? 'shadow' : config.filter,
      layer: 4,
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
      strokeWidth: config.strokeWidth,
      opacity: config.opacity,
      text: 'SVG',
      fontSize: 36,
      filter: useShadow ? 'shadow' : 'none',
      rotation: 0,
      strokeDasharray: isDashed ? '8 6' : undefined,
      gradient: useGradient ? createGradient('grad-fallback', '#4f46e5', '#7c3aed') : null,
      layer: 1,
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

export function sortByLayer(items: SvgShape[]) {
  return [...items].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
}

export function getStylePresetLabel(preset: StylePreset) {
  switch (preset) {
    case 'modern':
      return 'Современный';
    case 'glass':
      return 'Стекло';
    case 'outline':
      return 'Контур';
    case 'shadow':
      return 'Тень';
    case 'minimal':
    default:
      return 'Минимальный';
  }
}
