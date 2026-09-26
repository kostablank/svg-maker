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
};

export function parsePromptToShapes(prompt: string): SvgShape[] {
  const normalized = prompt.toLowerCase();
  const shapes: SvgShape[] = [];

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
  };

  const extractColor = (text: string) => {
    for (const [name, value] of Object.entries(colorMap)) {
      if (text.includes(name)) return value;
    }
    return '#4f46e5';
  };

  const hasCircle = normalized.includes('круг') || normalized.includes('circle');
  const hasRect = normalized.includes('квадрат') || normalized.includes('прямоугольник') || normalized.includes('rectangle') || normalized.includes('rect');
  const hasLine = normalized.includes('линия') || normalized.includes('line');
  const hasText = normalized.includes('текст') || normalized.includes('text');

  const fill = extractColor(normalized);

  if (hasCircle) {
    shapes.push({
      id: crypto.randomUUID(),
      type: 'circle',
      x: 360,
      y: 260,
      r: 110,
      fill,
      stroke: '#111827',
      strokeWidth: 4,
      opacity: 1,
      text: '',
      fontSize: 32,
    });
  }

  if (hasRect) {
    shapes.push({
      id: crypto.randomUUID(),
      type: 'rect',
      x: 150,
      y: 120,
      width: 220,
      height: 180,
      fill: '#60a5fa',
      stroke: '#111827',
      strokeWidth: 3,
      r: 20,
      opacity: 1,
      text: '',
      fontSize: 32,
    });
  }

  if (hasLine) {
    shapes.push({
      id: crypto.randomUUID(),
      type: 'line',
      x: 120,
      y: 450,
      width: 500,
      height: 0,
      fill: '#111827',
      stroke: '#111827',
      strokeWidth: 6,
      opacity: 1,
      text: '',
      fontSize: 24,
    });
  }

  if (hasText) {
    shapes.push({
      id: crypto.randomUUID(),
      type: 'text',
      x: 250,
      y: 340,
      fill: '#111827',
      stroke: '#111827',
      strokeWidth: 0,
      opacity: 1,
      text: 'SVG',
      fontSize: 52,
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
      r: 18,
      opacity: 1,
      text: 'SVG',
      fontSize: 36,
    });
  }

  return shapes;
}
