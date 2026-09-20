import React from 'react';
import { Award, CheckCircle, AlertCircle, Calendar, ExternalLink, Sparkles, Building2, Gift } from 'lucide-react';
import AudioSpeechPlayer from './AudioSpeechPlayer';

export default function ProgramCard({ item, onSelectProgram, isSelected = false, soundEnabled = true }) {
  const { program, relevance_score, grounded_explanation, eligibility } = item;
  const isEligible = eligibility?.is_eligible ?? true;

  return (
    <div className={`glass-card rounded-2xl p-5 transition-all duration-300 relative border ${
      isSelected
        ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/40 shadow-xl shadow-indigo-500/10'
        : isEligible
        ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
        : 'border-slate-800 opacity-90'
    }`}>
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {program.state}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            Match: {Math.round(relevance_score * 100)}%
          </span>
        </div>

        {/* Deterministic Eligibility Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          isEligible
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {isEligible ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{isEligible ? 'Eligible' : 'Needs Criteria'}</span>
        </div>
      </div>

      {/* Program Name */}
      <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
        {program.program_name}
      </h3>

      {/* Benefits */}
      <div className="mb-3.5 flex items-start gap-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        <Gift className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2">{program.benefits}</span>
      </div>

      {/* Grounded RAG explanation */}
      <div className="mb-4 p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-xs">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-bold text-indigo-300 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Grounded RAG Reason:
          </span>
          <AudioSpeechPlayer text={grounded_explanation} soundEnabled={soundEnabled} autoPlay={false} />
        </div>
        <p className="text-slate-300 leading-relaxed italic">{grounded_explanation}</p>
      </div>

      {/* Verification Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
        <span className="flex items-center gap-1 font-medium">
          <Building2 className="w-3 h-3 text-slate-500" /> {program.source}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Calendar className="w-3 h-3" /> {program.last_verified}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelectProgram(program)}
        className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          isSelected
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
        }`}
      >
        {isSelected ? 'Selected for Application Form' : 'Apply for This Program'}
      </button>
    </div>
  );
}
