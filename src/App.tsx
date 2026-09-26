import { useEffect, useMemo, useState } from 'react';
import { parsePromptToShapes, type SvgShape } from './parser';

const STORAGE_KEY = 'svg-maker-kb-projects';

const makeDefaultShape = (): SvgShape => ({
  id: crypto.randomUUID(),
  type: 'rect',
  x: 120,
  y: 80,
  width: 220,
  height: 140,
  fill: '#4f46e5',
  stroke: '#1f2937',
  strokeWidth: 3,
  r: 18,
  text: 'SVG',
  fontSize: 42,
  opacity: 1,
});

const sampleProject = () => ({
  id: crypto.randomUUID(),
  name: 'Новый проект',
  width: 800,
  height: 600,
  items: [
    {
      id: crypto.randomUUID(),
      type: 'rect',
      x: 120,
      y: 120,
      width: 260,
      height: 180,
      fill: '#4f46e5',
      stroke: '#1f2937',
      strokeWidth: 3,
      r: 24,
      opacity: 1,
      text: 'SVG',
      fontSize: 38,
    },
    {
      id: crypto.randomUUID(),
      type: 'circle',
      x: 540,
      y: 250,
      r: 110,
      fill: '#f59e0b',
      stroke: '#7c2d12',
      strokeWidth: 4,
      opacity: 1,
      text: '',
      fontSize: 24,
    },
  ] as SvgShape[],
});

const defaultProject = sampleProject();

function App() {
  const [projectName, setProjectName] = useState(defaultProject.name);
  const [items, setItems] = useState<SvgShape[]>(defaultProject.items);
  const [prompt, setPrompt] = useState('красный круг в центре, синий квадрат слева');
  const [projectList, setProjectList] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'prompt' | 'ai'>('editor');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<{ id: string; name: string; items: SvgShape[] }>;
        if (parsed.length > 0) {
          const first = parsed[0];
          setProjectList(parsed.map((p) => ({ id: p.id, name: p.name })));
          setProjectName(first.name);
          setItems(first.items);
        }
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    const docs = projectList.map((project) => ({
      id: project.id,
      name: project.name,
      items,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }, [items, projectList]);

  const svgMarkup = useMemo(() => buildSvgMarkup(items, 800, 600), [items]);

  const addShape = (shape: SvgShape) => {
    setItems((current) => [...current, shape]);
  };

  const generateFromPrompt = () => {
    const parsedShapes = parsePromptToShapes(prompt);
    if (parsedShapes.length === 0) {
      setItems([makeDefaultShape()]);
      return;
    }
    setItems(parsedShapes);
  };

  const saveCurrentProject = () => {
    const doc = { id: crypto.randomUUID(), name: projectName || 'Новый проект', items };
    setProjectList((current) => {
      const next = [doc, ...current.filter((item) => item.name !== doc.name)];
      return next.slice(0, 20);
    });
  };

  const deleteProject = (projectId: string) => {
    setProjectList((current) => current.filter((project) => project.id !== projectId));
  };

  const exportSvg = () => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'svg-project').replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <header className="toolbar">
        <div>
          <span className="brand">SVG Maker KB</span>
        </div>
        <div className="toolbar-actions">
          <button onClick={() => setItems([makeDefaultShape()])}>Новый холст</button>
          <button onClick={saveCurrentProject}>Сохранить</button>
          <button onClick={exportSvg}>Экспорт SVG</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar left-panel">
          <div className="section-title">Инструменты</div>

          <div className="tool-group">
            <button className="tool-btn" onClick={() => addShape({ ...makeDefaultShape(), type: 'rect', x: 150, y: 120, width: 220, height: 160 })}>+ прямоугольник</button>
            <button className="tool-btn" onClick={() => addShape({ ...makeDefaultShape(), type: 'circle', x: 360, y: 250, r: 90, fill: '#fbbf24' })}>+ круг</button>
            <button className="tool-btn" onClick={() => addShape({ ...makeDefaultShape(), type: 'line', x: 60, y: 260, width: 300, height: 0, stroke: '#111827' })}>+ линия</button>
            <button className="tool-btn" onClick={() => addShape({ ...makeDefaultShape(), type: 'text', x: 250, y: 260, text: 'Текст', fontSize: 46, fill: '#111827' })}>+ текст</button>
          </div>

          <div className="section-title">Память</div>
          <div className="project-list">
            {projectList.length === 0 ? (
              <p>Нет сохранённых проектов</p>
            ) : (
              projectList.map((project) => (
                <div key={project.id} className="project-item">
                  <span>{project.name}</span>
                  <button onClick={() => deleteProject(project.id)}>Удалить</button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="canvas-panel">
          <div className="tab-bar">
            <button className={activeTab === 'editor' ? 'tab active' : 'tab'} onClick={() => setActiveTab('editor')}>Редактор</button>
            <button className={activeTab === 'prompt' ? 'tab active' : 'tab'} onClick={() => setActiveTab('prompt')}>Генератор</button>
            <button className={activeTab === 'ai' ? 'tab active' : 'tab'} onClick={() => setActiveTab('ai')}>AI / PNG</button>
          </div>

          {activeTab === 'editor' && (
            <div className="canvas-wrap">
              <svg viewBox="0 0 800 600" className="canvas" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="prompt-panel">
              <label className="label">Описание для генерации</label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                placeholder="Например: красный круг в центре, синий квадрат слева"
              />

              <div className="prompt-actions">
                <button onClick={generateFromPrompt}>Генерировать</button>
                <button className="ghost" onClick={() => setPrompt('синий круг в центре, жёлтая линия снизу')}>Пример</button>
              </div>

              <div className="results-box">
                <div className="mini-preview">
                  <svg viewBox="0 0 800 600" dangerouslySetInnerHTML={{ __html: buildSvgMarkup(parsePromptToShapes(prompt), 800, 600) }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="ai-panel">
              <div className="section-title">AI / PNG</div>
              <p>Здесь можно подключить позже внешний AI-провайдер, например Pollinations. Пока активен безопасный локальный режим.</p>
              <div className="ai-card">
                <strong>Функции:</strong>
                <ul>
                  <li>генерация PNG через сервис</li>
                  <li>импорт готового изображения</li>
                  <li>внутренний локальный генератор</li>
                </ul>
              </div>
            </div>
          )}
        </main>

        <aside className="sidebar right-panel">
          <div className="section-title">Свойства проекта</div>
          <label className="label">Название</label>
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />

          <div className="section-title">Список объектов</div>
          <div className="objects-list">
            {items.map((shape, index) => (
              <div className="object-item" key={shape.id}>
                <span>{index + 1}. {shape.type}</span>
                <button onClick={() => setItems((current) => current.filter((item) => item.id !== shape.id))}>Удалить</button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function buildSvgMarkup(items: SvgShape[], width: number, height: number) {
  const shapes = items
    .map((shape) => {
      const style = `fill: ${shape.fill}; stroke: ${shape.stroke}; stroke-width: ${shape.strokeWidth}; opacity: ${shape.opacity};`;

      if (shape.type === 'rect') {
        return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.r ?? 0}" style="${style}" />`;
      }

      if (shape.type === 'circle') {
        return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.r ?? 50}" style="${style}" />`;
      }

      if (shape.type === 'line') {
        return `<line x1="${shape.x}" y1="${shape.y}" x2="${shape.x + (shape.width || 180)}" y2="${shape.y + (shape.height || 0)}" style="${style}" />`;
      }

      if (shape.type === 'text') {
        return `<text x="${shape.x}" y="${shape.y}" fill="${shape.fill}" font-size="${shape.fontSize ?? 32}" font-family="Arial, sans-serif" font-weight="700">${escapeHtml(shape.text || 'Текст')}</text>`;
      }

      return '';
    })
    .join('');

  return `<rect width="100%" height="100%" fill="#ffffff"></rect>${shapes}`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default App;
