import React, { useState, useEffect } from 'react';
import { SiteManifest, Block } from '../../types/manifest';
import { renderStaticSite } from '../../core/renderer';
import { runManifestTests, TestSuiteResult } from '../../core/tester';
import { saveVersionSnapshot, getVersionHistory, VersionSnapshot } from '../../core/versioning';
import { BlockFormEditor } from './BlockFormEditor';
import { ThemeEditor } from './ThemeEditor';
import { TestModal } from './TestModal';
import { VersionModal } from './VersionModal';
import { AiForgeModal } from './AiForgeModal';
import { TemplatesModal } from './TemplatesModal';
import { AddBlockModal } from './AddBlockModal';
import { ExportZipModal } from './ExportZipModal';
import { MetadataCacheEditor } from './MetadataCacheEditor';
import {
  Layers,
  Palette,
  Eye,
  Code2,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Sparkles,
  Download,
  ShieldCheck,
  History,
  LayoutTemplate,
  Flame,
  Check,
  ArrowRight,
  Film,
  Cloud,
} from 'lucide-react';
import { PromoVideoStudioModal } from './PromoVideoStudioModal';

interface ForgeWorkspaceProps {
  initialManifest: SiteManifest;
  onBackToHome: () => void;
}

export const ForgeWorkspace: React.FC<ForgeWorkspaceProps> = ({
  initialManifest,
  onBackToHome,
}) => {
  const [manifest, setManifest] = useState<SiteManifest>(initialManifest);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(
    initialManifest.blocks[0]?.id || ''
  );
  const [activeSideTab, setActiveSideTab] = useState<'blocks' | 'theme' | 'metadata' | 'json'>('blocks');
  const [mobileViewTab, setMobileViewTab] = useState<'editor' | 'preview'>('editor');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isExportZipOpen, setIsExportZipOpen] = useState(false);
  const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);

  // Tests & Versioning
  const [testResult, setTestResult] = useState<TestSuiteResult>(() => runManifestTests(manifest));
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(() =>
    getVersionHistory(manifest.projectId)
  );

  // When manifest changes, re-run tests & update timestamps
  const handleUpdateManifest = (newManifest: SiteManifest, saveSnapshot = true) => {
    setManifest(newManifest);
    setTestResult(runManifestTests(newManifest));
    if (saveSnapshot) {
      const updatedHistory = saveVersionSnapshot(newManifest);
      setSnapshots(updatedHistory);
    }
  };

  // Block manipulations
  const handleBlockChange = (updated: Block) => {
    const updatedBlocks = manifest.blocks.map((b) => (b.id === updated.id ? updated : b));
    handleUpdateManifest({
      ...manifest,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddBlock = (newBlock: Block) => {
    const updatedBlocks = [...manifest.blocks, newBlock];
    handleUpdateManifest({
      ...manifest,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (id: string) => {
    if (manifest.blocks.length <= 1) {
      alert('حداقل یک بلاک باید در صفحه باقی بماند.');
      return;
    }
    const updatedBlocks = manifest.blocks.filter((b) => b.id !== id);
    handleUpdateManifest({
      ...manifest,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(updatedBlocks[0]?.id || '');
    }
  };

  const handleDuplicateBlock = (id: string) => {
    const block = manifest.blocks.find((b) => b.id === id);
    if (!block) return;
    const cloned: Block = JSON.parse(JSON.stringify(block));
    cloned.id = `${block.type}-${Date.now()}`;
    const idx = manifest.blocks.findIndex((b) => b.id === id);
    const updatedBlocks = [...manifest.blocks];
    updatedBlocks.splice(idx + 1, 0, cloned);
    handleUpdateManifest({
      ...manifest,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
    setSelectedBlockId(cloned.id);
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = manifest.blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === manifest.blocks.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updatedBlocks = [...manifest.blocks];
    const [moved] = updatedBlocks.splice(idx, 1);
    updatedBlocks.splice(targetIdx, 0, moved);

    handleUpdateManifest({
      ...manifest,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    });
  };

  const selectedBlock = manifest.blocks.find((b) => b.id === selectedBlockId) || manifest.blocks[0];
  const renderedSite = renderStaticSite(manifest);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col overflow-hidden">
      
      {/* ============================================================== */}
      {/* Studio Top Control Bar                                         */}
      {/* ============================================================== */}
      <div className="w-full bg-[#0d121f] border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2.5 z-30">
        
        {/* Left: Back & Project Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="بازگشت به معرفی کوره"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <input
              type="text"
              value={manifest.meta.title}
              onChange={(e) =>
                handleUpdateManifest({
                  ...manifest,
                  meta: { ...manifest.meta, title: e.target.value },
                })
              }
              className="text-xs sm:text-sm font-bold bg-transparent text-white focus:outline-none border-b border-transparent focus:border-amber-400 max-w-[180px] sm:max-w-[320px] truncate"
            />
          </div>
        </div>

        {/* Center / Right: Tool Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Templates */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">قالب‌ها</span>
          </button>

          {/* AI Forge Assistant */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
            <span>دستیار هوش مصنوعی</span>
          </button>

          {/* Automated Test Score */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              testResult.score >= 80
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>تست: {testResult.score}%</span>
          </button>

          {/* Version History */}
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="تاریخچه نسخه‌ها"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">نسخه‌ها</span>
          </button>

          {/* Promo Video Reel Studio */}
          <button
            onClick={() => setIsPromoVideoOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="استودیوی تولید ویدیوی ریلز و استوری اینستاگرام"
          >
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">ویدیوی ریلز</span>
          </button>

          {/* Real ZIP Export */}
          <button
            onClick={() => setIsExportZipOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی ZIP</span>
          </button>
        </div>

      </div>

      {/* Mobile Toggle Bar: Editor vs Preview */}
      <div className="lg:hidden flex border-b border-white/10 bg-slate-900">
        <button
          onClick={() => setMobileViewTab('editor')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            mobileViewTab === 'editor'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>پنل ویرایش</span>
        </button>
        <button
          onClick={() => setMobileViewTab('preview')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            mobileViewTab === 'preview'
              ? 'border-amber-400 text-amber-300 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>پیش‌نمایش زنده</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* Main Studio Body: Split Editor & Live Preview                  */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Right Pane: Visual Editor & Block Inspector */}
        <div
          className={`w-full lg:w-[480px] xl:w-[540px] flex-shrink-0 flex flex-col bg-[#0b101c] border-l border-white/10 ${
            mobileViewTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          
          {/* Sub-tabs: Blocks, Theme, Manifest JSON */}
          <div className="flex border-b border-white/10 bg-slate-950 px-3 pt-2 gap-1">
            <button
              onClick={() => setActiveSideTab('blocks')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeSideTab === 'blocks'
                  ? 'bg-[#0b101c] text-amber-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>بلاک‌ها ({manifest.blocks.length})</span>
            </button>
            <button
              onClick={() => setActiveSideTab('theme')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeSideTab === 'theme'
                  ? 'bg-[#0b101c] text-amber-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>طراحی و تم</span>
            </button>
            <button
              onClick={() => setActiveSideTab('metadata')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeSideTab === 'metadata'
                  ? 'bg-[#0b101c] text-amber-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>متادیتا و کش ابری</span>
            </button>
            <button
              onClick={() => setActiveSideTab('json')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeSideTab === 'json'
                  ? 'bg-[#0b101c] text-amber-300 border-t border-x border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>سند JSON</span>
            </button>
          </div>

          {/* Sub-tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSideTab === 'blocks' && (
              <>
                {/* Block Selector Carousel / List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">چیدمان بلاک‌های صفحه:</span>
                    <button
                      onClick={() => setIsAddBlockOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن بلاک</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {manifest.blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedBlockId === block.id
                            ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                            : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono text-slate-500">{idx + 1}</span>
                          <div>
                            <div className="text-xs font-bold capitalize flex items-center gap-1.5">
                              <span>{block.type}</span>
                              {selectedBlockId === block.id && (
                                <span className="text-[10px] px-1.5 rounded bg-amber-500/20 text-amber-300">
                                  در حال ویرایش
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                              {(block as any).title || block.id}
                            </span>
                          </div>
                        </div>

                        {/* Order & action buttons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMoveBlock(block.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                            title="انتقال به بالا"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(block.id, 'down')}
                            disabled={idx === manifest.blocks.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                            title="انتقال به پایین"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateBlock(block.id)}
                            className="p-1 rounded text-slate-400 hover:text-amber-400"
                            title="تکرار بلاک"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                            title="حذف بلاک"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Block Inspector */}
                {selectedBlock && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        ویرایش محتوای: {selectedBlock.type}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5">
                      <BlockFormEditor block={selectedBlock} onChange={handleBlockChange} />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeSideTab === 'theme' && (
              <div className="p-2">
                <ThemeEditor manifest={manifest} onChange={(m) => handleUpdateManifest(m)} />
              </div>
            )}

            {activeSideTab === 'json' && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">سند JSON مانیفست استاندارد:</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `manifest-${manifest.projectId}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      title="دانلود مستقیم فایل مانیفست پروژه"
                    >
                      <Download className="w-3 h-3" />
                      <span>دانلود manifest.json</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
                        alert('مانیفست در حافظه کپی شد.');
                      }}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>کپی</span>
                    </button>
                  </div>
                </div>
                <pre
                  className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-emerald-400 overflow-x-auto border border-white/5"
                  dir="ltr"
                >
                  {JSON.stringify(manifest, null, 2)}
                </pre>
              </div>
            )}

            {activeSideTab === 'metadata' && (
              <MetadataCacheEditor
                manifest={manifest}
                onUpdateManifest={handleUpdateManifest}
              />
            )}
          </div>

        </div>

        {/* Left Pane: Live Interactive Render Preview */}
        <div
          className={`flex-1 flex flex-col bg-[#05080f] overflow-hidden ${
            mobileViewTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          
          {/* Viewport switch toolbar */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-white/5 flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setViewportMode('mobile')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${
                  viewportMode === 'mobile'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">موبایل (375px)</span>
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${
                  viewportMode === 'tablet'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تبلت (768px)</span>
              </button>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-all ${
                  viewportMode === 'desktop'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">دسکتاپ (کامل)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="hidden md:inline">پیش‌نمایش لحظه‌ای مانیفست</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

          </div>

          {/* Iframe Preview Container */}
          <div className="flex-1 p-3 sm:p-6 overflow-auto flex items-center justify-center bg-[#070b14]">
            <div
              className={`transition-all duration-300 overflow-hidden shadow-2xl border border-white/10 ${
                viewportMode === 'mobile'
                  ? 'w-[375px] h-[667px] ring-8 ring-slate-900 rounded-[36px]'
                  : viewportMode === 'tablet'
                  ? 'w-[768px] h-[850px] ring-8 ring-slate-900 rounded-2xl'
                  : 'w-full h-full rounded-xl'
              }`}
            >
              <iframe
                title="Tavana Forge Live Preview"
                srcDoc={renderedSite.fullHtml}
                className="w-full h-full border-none bg-slate-950"
                sandbox="allow-scripts"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        result={testResult}
      />

      <VersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        snapshots={snapshots}
        currentProjectId={manifest.projectId}
        onRestore={(restored) => handleUpdateManifest(restored, false)}
        onSaveCurrentSnapshot={(label) => {
          const updated = saveVersionSnapshot(manifest, label);
          setSnapshots(updated);
        }}
      />

      <AiForgeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentManifest={manifest}
        onApplyNewManifest={(newM) => handleUpdateManifest(newM)}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(tmplManifest) => handleUpdateManifest(tmplManifest)}
      />

      <AddBlockModal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        onAddBlock={handleAddBlock}
      />

      <ExportZipModal
        isOpen={isExportZipOpen}
        onClose={() => setIsExportZipOpen(false)}
        manifest={manifest}
      />

      <PromoVideoStudioModal
        isOpen={isPromoVideoOpen}
        onClose={() => setIsPromoVideoOpen(false)}
        manifest={manifest}
      />

    </div>
  );
};
