import React from 'react';
import { Cpu, CheckCircle2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export default function SkillMappingBadge({ userSkills = [], rawVoiceDesc = '' }) {
  if (!userSkills || userSkills.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Controlled Skill Taxonomy Mapping
            </h3>
            <p className="text-[11px] text-slate-400">
              Raw spoken words mapped strictly to standardized skills (Zero LLM Hallucination)
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400" /> Standardized
        </span>
      </div>

      {/* Raw spoken description vs Standardized skills */}
      {rawVoiceDesc && (
        <div className="mb-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between gap-2">
          <span className="text-slate-400 font-medium italic">Spoken: "{rawVoiceDesc}"</span>
          <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>
      )}

      {/* Badges list */}
      <div className="flex flex-wrap gap-2.5">
        {userSkills.map((skillName, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/30 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-indigo-100">{skillName}</span>
              <span className="block text-[10px] font-medium text-indigo-300/80">
                Verified Skill Taxonomy Code
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
