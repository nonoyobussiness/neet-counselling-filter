export function App() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <header className="border-b border-line bg-paper px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-surgical rounded-sm"></div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              NEET Choice Selector
            </h1>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 bg-white border border-line text-ink rounded">
            v1.0 (Phase 0 Skeleton)
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="bg-white border border-line p-8 rounded-none shadow-sm">
          <div className="border-l-4 border-surgical pl-4 mb-6">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Official Choice-Filling Companion
            </h2>
            <p className="text-ink/80 text-sm mt-1">
              Filter and rank Telangana MBBS colleges on ratings, beds, fees, and distance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-line">
            <div className="border border-dashed border-line p-4">
              <span className="font-mono text-xs text-surgical block uppercase tracking-wider mb-1">Architecture</span>
              <p className="font-medium text-sm">Static-Data Client-Side SPA</p>
            </div>
            <div className="border border-dashed border-line p-4">
              <span className="font-mono text-xs text-surgical block uppercase tracking-wider mb-1">Stack</span>
              <p className="font-medium text-sm">React + TypeScript + Tailwind + Vite</p>
            </div>
            <div className="border border-dashed border-line p-4">
              <span className="font-mono text-xs text-marigold block uppercase tracking-wider mb-1">Next Phase</span>
              <p className="font-medium text-sm">Phase 1: colleges.json Data Bundle</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
