import React from 'react';
import { Bot, User, Sparkles, ChevronRight, Terminal, HelpCircle } from 'lucide-react';
import AudioSpeechPlayer from './AudioSpeechPlayer';

export default function ConversationalFlow({
  turns = [],
  currentQuestion = '',
  onQuickResponse,
  isProcessing = false,
  soundEnabled = true
}) {
  const quickSuggestions = [
    { label: "Example 1 (Electrician)", text: "I am Ramesh, 6 years electrical work experience in Karnataka" },
    { label: "Example 2 (Skills)", text: "I do house wiring and repair fans" },
    { label: "Example 3 (Plumber)", text: "I am a plumber with 4 years experience doing pipe fitting in Bangalore" },
    { label: "Voice Correction", text: "Change my experience to 7 years" }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col h-full shadow-2xl">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Voice Assistant</h2>
            <p className="text-[11px] text-slate-400">One clear question at a time • Speaks in your language</p>
          </div>
        </div>

        {currentQuestion && (
          <AudioSpeechPlayer text={currentQuestion} soundEnabled={soundEnabled} autoPlay={true} />
        )}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[380px] custom-scrollbar">
        {turns.length === 0 && (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <Bot className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white mb-1">
              Namaste! Welcome to SkillSaathi
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Tap the large microphone below and describe your work, or click one of the quick voice sample chips to test.
            </p>
          </div>
        )}

        {turns.map((turn, idx) => (
          <div key={idx} className="space-y-3">
            {/* User message */}
            {turn.user_speech && (
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] text-xs font-medium shadow-md">
                  <p>{turn.user_speech}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Agent response */}
            {turn.agent_voice_script && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] text-xs text-slate-200 space-y-2">
                  <p>{turn.agent_voice_script}</p>

                  {/* Agent Tool Logs (Transparency) */}
                  {turn.agent_logs && turn.agent_logs.length > 0 && (
                    <details className="mt-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                      <summary className="cursor-pointer font-mono hover:text-indigo-300 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-indigo-400" /> View Agent Tool Executions ({turn.agent_logs.length})
                      </summary>
                      <ul className="mt-1 font-mono space-y-0.5 bg-slate-950 p-2 rounded-lg text-emerald-400">
                        {turn.agent_logs.map((log, lIdx) => (
                          <li key={lIdx}>&gt; {log}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold p-3 rounded-xl bg-indigo-950/40 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" /> SkillSaathi agent is analyzing your speech...
          </div>
        )}
      </div>

      {/* Quick Spoken Voice Sample Chips */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-indigo-400" /> Quick Voice Sample Chips (Click to test):
        </span>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onQuickResponse(s.text)}
              disabled={isProcessing}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/80 text-[11px] text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 transition-all text-left flex items-center gap-1 group"
            >
              <span>{s.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
