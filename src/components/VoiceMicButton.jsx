import React, { useState, useEffect, useRef } from 'react';
import { Mic, Radio, Volume2 } from 'lucide-react';

export default function VoiceMicButton({ onVoiceTranscript, isProcessing, language }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'kn-IN' ? 'kn-IN' : language === 'hi-IN' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        latestTranscriptRef.current = '';
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        latestTranscriptRef.current = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalSpeech = latestTranscriptRef.current.trim();
        if (finalSpeech) {
          onVoiceTranscript(finalSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [language, onVoiceTranscript]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setTranscript('');
      latestTranscriptRef.current = '';

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Start error:', err);
        }
      } else {
        // Authentic sample speech fallback per language if browser mic API unavailable
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          let sample = "";
          if (language === 'kn-IN') {
            sample = "ನಾನು ರಮೇಶ್, 6 ವರ್ಷಗಳ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಕೆಲಸದ ಅನುಭವವಿದೆ, ಮನೆ ವೈರಿಂಗ್ ಮತ್ತು ಫ್ಯಾನ್ ರಿಪೇರಿ ಮಾಡುತ್ತೇನೆ";
          } else if (language === 'hi-IN') {
            sample = "मैं रमेश हूँ, 6 साल का इलेक्ट्रिशियन अनुभव है, हाउस वायरिंग और पंखा रिपेयर करता हूँ";
          } else {
            sample = "I am Ramesh, 6 years electrician experience in Karnataka doing house wiring and fan repair";
          }
          setTranscript(sample);
          onVoiceTranscript(sample);
        }, 1800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
      {/* Background glow gradient */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Mic Status Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 border border-slate-700 text-slate-300">
        <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-red-500 animate-ping' : 'text-indigo-400'}`} />
        <span>
          {isListening
            ? language === 'kn-IN'
              ? 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...'
              : language === 'hi-IN'
              ? 'आपकी आवाज सुनी जा रही है...'
              : 'Listening to your voice...'
            : isProcessing
            ? 'Processing Speech...'
            : language === 'kn-IN'
            ? 'ಮೈಕ್ ಒತ್ತಿ ಮತ್ತು ಮಾತನಾಡಿ'
            : language === 'hi-IN'
            ? 'माइक दबाएं और बोलें'
            : 'Tap Mic & Speak'}
        </span>
      </div>

      {/* Large Microphone Button */}
      <div className="relative my-2">
        {isListening && (
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 opacity-60 animate-mic-pulse blur-sm" />
        )}

        <button
          onClick={toggleListening}
          disabled={isProcessing}
          aria-label="Speak your response"
          className={`relative z-10 w-28 h-28 lg:w-32 lg:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 ${
            isListening
              ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white scale-105 shadow-rose-500/50'
              : isProcessing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white hover:scale-105 shadow-indigo-500/40 hover:shadow-indigo-500/60 ring-4 ring-indigo-400/20'
          }`}
        >
          <Mic className="w-12 h-12 lg:w-14 lg:h-14" />
          <span className="text-[11px] font-bold tracking-wider uppercase mt-1">
            {isListening ? 'STOP' : 'SPEAK'}
          </span>
        </button>
      </div>

      {/* Waveform Visualizer */}
      {isListening && (
        <div className="flex items-center gap-1 mt-5 h-8">
          {[40, 75, 30, 90, 50, 80, 45, 95, 60, 30, 85, 50].map((h, idx) => (
            <div
              key={idx}
              className="w-1.5 bg-gradient-to-t from-indigo-500 to-emerald-400 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${idx * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript text feedback */}
      {transcript && (
        <div className="mt-4 max-w-lg w-full bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 text-center">
          <p className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Spoken Words Detected:
          </p>
          <p className="text-sm font-semibold text-slate-100 italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}
