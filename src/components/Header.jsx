import React from 'react';
import { Volume2, VolumeX, Eye, Languages, Sparkles, ShieldCheck } from 'lucide-react';

export default function Header({ 
  language, 
  setLanguage, 
  highContrast, 
  setHighContrast, 
  soundEnabled, 
  setSoundEnabled 
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400">
                SkillSaathi
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Voice-First Skilling Assistant for Workers • Speak in your language
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <Languages className="w-4 h-4 text-indigo-400 ml-2.5 mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="en-IN" className="bg-slate-900 text-slate-200">English (India)</option>
              <option value="kn-IN" className="bg-slate-900 text-slate-200">ಕನ್ನಡ (Kannada)</option>
              <option value="hi-IN" className="bg-slate-900 text-slate-200">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Audio Readout Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Voice Readout"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Voice On' : 'Voice Muted'}</span>
          </button>

          {/* High Contrast Accessibility Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-md shadow-yellow-400/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Eye className="w-4 h-4" />
            <span>{highContrast ? 'Standard Mode' : 'High Contrast'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
