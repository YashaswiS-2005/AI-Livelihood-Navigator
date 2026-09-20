import React, { useState } from 'react';
import { FileText, CheckCircle2, Edit3, Mic, Volume2, Send, RefreshCw, Award, MapPin, Briefcase, GraduationCap, Clock } from 'lucide-react';
import AudioSpeechPlayer from './AudioSpeechPlayer';

export default function ApplicationFormPreview({
  form = {},
  profile = {},
  onVoiceCorrection,
  onSubmitApplication,
  soundEnabled = true
}) {
  const [correctionInput, setCorrectionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleApplyCorrection = (e) => {
    e.preventDefault();
    if (correctionInput.trim()) {
      onVoiceCorrection(correctionInput);
      setCorrectionInput('');
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await onSubmitApplication();
      setSubmittedData(res);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillsList = form.standardized_skills || profile.skills || ['Domestic Electrical Wiring', 'Electrical Appliance Repair'];

  return (
    <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 shadow-2xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Application Form Preview
            </h2>
            <p className="text-xs text-slate-400">
              Auto-populated from spoken profile details • No long reading or typing required
            </p>
          </div>
        </div>

        <AudioSpeechPlayer 
          text={`Application preview for ${form.applicant_name || 'Ramesh'}. Occupation: ${profile.occupation || 'Electrician'}, Experience: ${profile.experience_years || 6} years. Skills: ${skillsList.join(', ')}.`} 
          soundEnabled={soundEnabled} 
          autoPlay={false} 
        />
      </div>

      {/* Auto-populated Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Field 1: Applicant Name */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Applicant Full Name
          </span>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            {profile.name || form.applicant_name || 'Not Provided Yet'}
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Voice Verified</span>
          </p>
        </div>

        {/* Field 2: Occupation */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Primary Occupation
          </span>
          <p className="text-sm font-bold text-white">
            {profile.occupation || form.occupation || 'Not Specified Yet'}
          </p>
        </div>

        {/* Field 3: Experience */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Experience Years
          </span>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            {profile.experience_years ? `${profile.experience_years} Years` : 'Not Specified Yet'}
          </p>
        </div>

        {/* Field 4: Education Qualification */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Education Level
          </span>
          <p className="text-sm font-bold text-white">
            {profile.education || form.education_qualification || 'Not Specified Yet'}
          </p>
        </div>

        {/* Field 5: Location */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Location / State
          </span>
          <p className="text-sm font-bold text-white">
            {profile.location || form.location_state || 'Not Specified Yet'}
          </p>
        </div>

        {/* Field 6: Target Skilling Program */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 md:col-span-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Target Skilling Program
          </span>
          <p className="text-sm font-bold text-emerald-300">
            {form.target_program || 'PMKVY 4.0 Advanced Electrician & Solar PV Technician'}
          </p>
        </div>

        {/* Field 7: Standardized Skills */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 md:col-span-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Standardized Skills Mapped (Controlled Taxonomy)
          </span>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-200 border border-indigo-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Correction Section */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/20">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
          <Edit3 className="w-4 h-4 text-indigo-400" /> Voice Field Correction
        </label>
        <p className="text-[11px] text-slate-400 mb-2.5">
          Notice any wrong detail? Speak or type e.g. <span className="text-indigo-300 italic">"Change my experience to 7 years"</span> or <span className="text-indigo-300 italic">"Location is Karnataka"</span>
        </p>

        <form onSubmit={handleApplyCorrection} className="flex gap-2">
          <input
            type="text"
            value={correctionInput}
            onChange={(e) => setCorrectionInput(e.target.value)}
            placeholder='e.g. "Change my experience to 7 years"'
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Update Form
          </button>
        </form>

        {/* Quick Correction chips */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => onVoiceCorrection("Change my experience to 7 years")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-indigo-300 border border-slate-800 transition-all"
          >
            "Change experience to 7 years"
          </button>
          <button
            type="button"
            onClick={() => onVoiceCorrection("Change education to ITI")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-indigo-300 border border-slate-800 transition-all"
          >
            "Change education to ITI"
          </button>
        </div>
      </div>

      {/* Confirmation & Submission Button */}
      {!submittedData ? (
        <button
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transform active:scale-98 transition-all"
        >
          {isSubmitting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" /> Voice Confirm & Submit Application
            </>
          )}
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-base font-bold text-white mb-1">
            Application Submitted Successfully!
          </h4>
          <p className="text-xs text-slate-300 font-mono mb-2">
            Application ID: <span className="text-emerald-400 font-bold">{submittedData.application_id}</span>
          </p>
          <p className="text-xs text-slate-400">
            {submittedData.confirmation_message}
          </p>
        </div>
      )}
    </div>
  );
}
