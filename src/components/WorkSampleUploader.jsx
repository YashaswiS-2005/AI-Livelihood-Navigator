import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, ShieldCheck, Award, Sparkles, RefreshCw } from 'lucide-react';

export default function WorkSampleUploader({ trade = 'Electrician', onSkillVerified }) {
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [samplePreview, setSamplePreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSamplePreview(reader.result);
        analyzeWorkSample();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWorkSample = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('trade', trade || 'Electrician');
      formData.append('description', `${trade} practical work sample verification`);

      const res = await fetch('/api/skill/verify-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setVerificationResult(data);
      if (onSkillVerified) {
        onSkillVerified(data);
      }
    } catch (err) {
      console.warn('Verification error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSampleDemo = () => {
    setSamplePreview("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80");
    analyzeWorkSample();
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Multimodal Work Sample Photo Verification
            </h2>
            <p className="text-xs text-slate-400">
              Upload photo of your work (wiring, plumbing, welding) for AI Quality Verification
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> AI Vision Audit
        </span>
      </div>

      {/* Upload Zone */}
      {!verificationResult ? (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl bg-slate-950/60 transition-all text-center">
          {samplePreview ? (
            <img src={samplePreview} alt="Work sample preview" className="max-h-48 rounded-xl mb-3 shadow-md border border-slate-700" />
          ) : (
            <Upload className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
          )}

          <h3 className="text-sm font-bold text-white mb-1">
            {isUploading ? 'Analyzing Work Sample Quality...' : 'Upload Work Sample Photo'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            Upload a clear photo of your trade work (e.g. electrical wiring, fan assembly, or pipe connection)
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Select / Take Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={triggerSampleDemo}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              Test with Demo Electrical Photo
            </button>
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-400 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" /> Running AI Visual Inspection on safety & standards...
            </div>
          )}
        </div>
      ) : (
        /* Verification Result Badge */
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {verificationResult.badge_title}
                </h3>
                <p className="text-[11px] text-emerald-300 font-mono">
                  Certificate ID: {verificationResult.certificate_id}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Score: {Math.round(verificationResult.skill_confidence_score * 100)}% ({verificationResult.quality_rating})
            </span>
          </div>

          <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800 italic">
            "{verificationResult.analysis_details}"
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold">{verificationResult.safety_compliance}</span>
            <button
              onClick={() => {
                setVerificationResult(null);
                setSamplePreview(null);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Verify Another Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
