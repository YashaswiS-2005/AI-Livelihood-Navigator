import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RefreshCw } from 'lucide-react';

export default function AudioSpeechPlayer({ text, autoPlay = true, language = 'en-IN', soundEnabled = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    if (autoPlay && text && soundEnabled) {
      speakText(text);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, autoPlay, soundEnabled]);

  const speakText = (contentToSpeak) => {
    if (!('speechSynthesis' in window) || !contentToSpeak || !soundEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(contentToSpeak);
    utterance.lang = language === 'kn-IN' ? 'kn-IN' : language === 'hi-IN' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clear worker comprehension

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakText(text);
    }
  };

  if (!text) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-indigo-950/70 border border-indigo-500/30 rounded-xl px-3 py-1.5 shadow-sm">
      <button
        onClick={togglePlay}
        disabled={!soundEnabled}
        className={`p-1.5 rounded-lg transition-all ${
          isPlaying
            ? 'bg-indigo-600 text-white animate-pulse'
            : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
        }`}
        title={isPlaying ? 'Pause Audio' : 'Listen to Audio Prompt'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-indigo-400" />
          {isPlaying ? 'Reading Aloud...' : 'Click to Listen'}
        </span>
      </div>
    </div>
  );
}
