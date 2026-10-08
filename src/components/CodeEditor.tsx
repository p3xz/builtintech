'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  playerColor: 'cyan' | 'rose';
  playerLabel: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  playerColor,
  playerLabel,
  readOnly = false,
}: CodeEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const borderColor = playerColor === 'cyan' ? 'var(--player1)' : 'var(--player2)';
  const labelColor = playerColor === 'cyan' ? 'text-cyan-400' : 'text-rose-400';

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ borderTop: `2px solid ${borderColor}` }}
      >
        <span className={`text-xs font-mono font-medium ${labelColor} uppercase tracking-wider`}>
          {playerLabel}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          Python
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v || '')}
          onMount={handleMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            padding: { top: 8, bottom: 8 },
            wordWrap: 'on',
            tabSize: 4,
            readOnly,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  );
}
