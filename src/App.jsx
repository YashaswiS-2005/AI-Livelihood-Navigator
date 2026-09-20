import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, Download, Leaf, Lightbulb, Mic, Pause, Play, Printer, RotateCcw, Sparkles, Square, Volume2, X } from 'lucide-react';
import ResultsUpgrade from './components/ResultsUpgrade';

const QUESTIONS = [
  ['name', 'What is your name?', 'For example, Ram or Ramesh...'],
  ['education', 'What is your highest level of education?', 'For example, 10th, ITI, diploma...'],
  ['current_work', 'What work do you currently do?', 'For example, farming, electrical work, tailoring...'],
  ['skills', 'What skills do you use in your daily work?', 'For example, tractor operation, irrigation, crop care...'],
  ['experience', 'How many years of experience do you have?', 'For example, 4 years...'],
  ['interest', 'What are you interested in?', 'For example, agriculture technology or government jobs...'],
  ['goal', 'What would you like to achieve?', 'For example, increase income or start a business...'],
];
const KANNADA_QUESTIONS = [
  ['name', 'ನಿಮ್ಮ ಹೆಸರು ಏನು?', 'ಉದಾಹರಣೆಗೆ, ರಾಮೇಶ್ ಅಥವಾ ರಮೇಶ್...'],
  ['education', 'ನಿಮ್ಮ ಶಿಕ್ಷಣದ ಮಟ್ಟ ಏನು?', 'ಉದಾಹರಣೆಗೆ, 10 ನೇ, ITI, ಡಿಪ್ಲೋಮಾ...'],
  ['current_work', 'ನೀವು ಈಗ ಯಾವ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?', 'ಉದಾಹರಣೆಗೆ, farming, ವಿದ್ಯುತ್ ಕೆಲಸ, ಡ자인ಿಂಗ್...'],
  ['skills', 'ನಿಮ್ಮ everyday work ನಲ್ಲಿ ನೀವು ಯಾವ ಕೌಶಲ್ಯಗಳನ್ನು ಬಳಸುತ್ತೀರಿ?', 'ಉದಾಹರಣೆಗೆ, ಟ್ರಾಕ್ಟರ್ ಓಡಿಸುವುದು, ಪಂಪ್ ನಿರ್ವಹಣೆ, ರೈತಿಗನ ಕಾಳಜಿ...'],
  ['experience', 'ನಿಮ್ಮಲ್ಲಿ ಎಷ್ಟು ವರ್ಷವಾದ ಅನುಭವ ಇದೆ?', 'ಉದಾಹರಣೆಗೆ, 4 ವರ್ಷ...'],
  ['interest', 'ನಿಮ್ಮ ಇಷ್ಟದ ವಿಷಯ ಯಾವುದು?', 'ಉದಾಹರಣೆಗೆ: Farming technology, ಸರ್ಕಾರದ ಉದ್ಯೋಗಗಳು...'],
  ['goal', 'ನೀವು ಏನನ್ನು ಸಾಧಿಸಲು ಬಯಸುತ್ತೀರಿ?', 'ಉದಾಹರಣೆಗೆ, ಆದಾಯ ಹೆಚ್ಚಿಸುವುದು ಅಥವಾ ವ್ಯಾಪಾರ ಆರಂಭಿಸುವುದು...'],
];
const DEMO_PROFILE = { name: 'Ramesh', education: '10th', current_work: 'Farmer', skills: 'Farming, Tractor Operation, Irrigation', experience: '4 years', interest: 'Agriculture Technology', goal: 'Increase Income' };
const DEMO_POTENTIAL = [{ id: 'resource-management', name: 'Resource Management', reason: 'Your farm work suggests planning and coordinating resources.' }, { id: 'supplier-coordination', name: 'Supplier Coordination', reason: 'Farm work often involves coordinating seeds, inputs, and vendors.' }];
const DEMO_OPPORTUNITIES = [
  { id: 'agricultural-equipment-operator', title: 'Agricultural Equipment Service Provider', summary: 'Maintain and support farm equipment for local farmers.', why: ['Farming and tractor experience', 'Practical equipment exposure', 'Agriculture income goal'], skill_gaps: ['Equipment Maintenance', 'Digital Service Management'], bridge_from: 'Farming + Tractor Operation', bridge_to: 'Agricultural Equipment Service Provider', training: 'Basic Equipment Maintenance', source: 'Demo Opportunity Dataset', roadmap: ['Existing Skills', 'Learn Equipment Maintenance', 'Practice Equipment Servicing', 'Explore Opportunities'] },
  { id: 'agri-tech-assistant', title: 'Agri-Tech Assistant', summary: 'Help farmers use digital tools and modern farm practices.', why: ['Farming knowledge', 'Interest in technology', 'Goal to increase income'], skill_gaps: ['Digital Agriculture'], bridge_from: 'Farming', bridge_to: 'Agri-Tech Assistant', training: 'Basic Digital Agriculture', source: 'Demo Opportunity Dataset', roadmap: ['Existing Skills', 'Learn Digital Agriculture', 'Practice With Farm Apps', 'Explore Opportunities'] },
  { id: 'irrigation-technician', title: 'Irrigation Technician', summary: 'Install and maintain efficient irrigation systems for farms.', why: ['Irrigation experience', 'Practical equipment knowledge'], skill_gaps: ['Irrigation Systems'], bridge_from: 'Irrigation Management', bridge_to: 'Irrigation Technician', training: 'Basic Irrigation Systems', source: 'Demo Opportunity Dataset', roadmap: ['Existing Skills', 'Learn Irrigation Systems', 'Practice Installation', 'Explore Opportunities'] },
];

export default function App() {
  const [view, setView] = useState('home');
  const [language, setLanguage] = useState('English');
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [draft, setDraft] = useState('');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [potential, setPotential] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [opportunities, setOpportunities] = useState(DEMO_OPPORTUNITIES);
  const [selected, setSelected] = useState(DEMO_OPPORTUNITIES[0]);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const recognitionRef = useRef(null);
  const finalRef = useRef('');
  const latestRef = useRef('');
  const question = QUESTIONS[step];
  const kannada = language === 'Kannada';
  const questionData = kannada ? KANNADA_QUESTIONS[step] || question : question;
  const currentQuestionText = questionData[1];
  const currentPlaceholder = questionData[2];

  const getSpeechVoice = (langCode) => {
    if (!('speechSynthesis' in window)) return null;
    const availableVoices = window.speechSynthesis.getVoices();
    if (!availableVoices.length) return null;

    const ordered = [
      availableVoices.find((voice) => voice.lang.toLowerCase() === `${langCode.toLowerCase()}-in`),
      availableVoices.find((voice) => voice.lang.toLowerCase().startsWith(`${langCode.toLowerCase()}-`)),
      availableVoices.find((voice) => voice.lang.toLowerCase().startsWith('en-')),
      availableVoices[0],
    ];

    return ordered.find(Boolean) || null;
  };

  const speakText = (text, preferredLang) => {
    if (!('speechSynthesis' in window)) {
      setNotice('Text-to-speech is unavailable in this browser.');
      return;
    }

    const availableVoices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredLang;
    utterance.rate = 0.95;

    const preferredVoice = getSpeechVoice(preferredLang === 'kn-IN' ? 'kn' : 'en');
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else if (preferredLang === 'kn-IN' && availableVoices.length) {
      const englishVoice = getSpeechVoice('en');
      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = 'en-IN';
        setNotice('Kannada voice is not installed on this browser. English voice is being used instead.');
      } else {
        setNotice('Kannada voice is not installed on this browser. Please install Kannada speech support.');
      }
    }

    if (!availableVoices.length) {
      setNotice('No speech voices are available in this browser. Install a language pack or use a browser with TTS support.');
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);
  useEffect(() => {
    if (view !== 'assessment') return undefined;
    const speechText = kannada ? currentQuestionText : question[1];
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = kannada ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.95;
    const fallbackVoice = getSpeechVoice(kannada ? 'kn' : 'en');
    if (fallbackVoice) utterance.voice = fallbackVoice;
    const timer = window.setTimeout(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [view, step, kannada, currentQuestionText, question]);

  const reset = () => { setView('assessment'); setStep(0); setProfile({}); setDraft(''); setTranscript(''); setPotential([]); setConfirmed([]); setNotice(''); setChatReply(''); setEditing(false); };
  const demo = () => { setProfile(DEMO_PROFILE); setPotential(DEMO_POTENTIAL); setConfirmed([]); setOpportunities(DEMO_OPPORTUNITIES); setSelected(DEMO_OPPORTUNITIES[0]); setView('results'); };

  const speakQuestion = () => {
    const speechText = kannada ? currentQuestionText : question[1];
    speakText(speechText, kannada ? 'kn-IN' : 'en-IN');
    setNotice(kannada ? 'ಪ್ರಶ್ನೆಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ.' : 'The question is being read aloud.');
  };

  const listen = () => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setNotice('Voice input is unavailable. Type your answer below.'); return; }
    const recognition = new Recognition(); recognition.lang = kannada ? 'kn-IN' : 'en-IN'; recognition.continuous = true; recognition.interimResults = true;
    recognition.onstart = () => { finalRef.current = ''; latestRef.current = ''; setListening(true); setNotice('Listening...'); };
    recognition.onresult = (event) => { let interim = ''; for (let i = event.resultIndex; i < event.results.length; i += 1) { const result = event.results[i]; if (result.isFinal) finalRef.current += `${result[0].transcript} `; else interim += result[0].transcript; } const text = `${finalRef.current} ${interim}`.trim(); latestRef.current = text; setDraft(text); setTranscript(text); };
    recognition.onerror = () => { setListening(false); setNotice('We could not hear that. Type your answer instead.'); };
    recognition.onend = () => { const text = finalRef.current.trim() || latestRef.current.trim(); if (text) { setDraft(text); setTranscript(text); } setListening(false); setNotice(text ? 'Answer captured. Review it.' : 'Nothing was heard.'); };
    recognitionRef.current = recognition; try { recognition.start(); } catch { setNotice('The microphone could not start.'); }
  };

  const submit = async (event) => {
    event.preventDefault(); if (!draft.trim()) return;
    const nextProfile = { ...profile, [question[0]]: draft.trim() }; setProfile(nextProfile);
    if (step < QUESTIONS.length - 1) { fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: draft.trim(), profile: nextProfile }) }).then((r) => r.ok ? r.json() : null).then((data) => setChatReply(data?.reply || '')).catch(() => {}); setStep(step + 1); setDraft(''); setTranscript(''); setEditing(false); setNotice(''); return; }
    try { const [profileResponse, recommendationResponse] = await Promise.all([fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: nextProfile }) }), fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: nextProfile }) })]); const profileData = await profileResponse.json(); const recommendationData = await recommendationResponse.json(); const matches = recommendationData.recommendations || []; setPotential(profileData.potential_skills || []); setOpportunities(matches); setSelected(matches[0] || null); } catch { setPotential([]); setOpportunities([]); setSelected(null); setNotice('Recommendation service is not connected. Start FastAPI or use Try Demo.'); }
    setView('confirm');
  };

  const confirmProfile = () => setView('results');

  const speak = () => {
    if (!selected || !window.speechSynthesis) return;
    const speechText = `${selected.title}. ${selected.summary} You need to learn ${(selected.skill_gaps || []).join(', ')}.`;
    const speech = new SpeechSynthesisUtterance(speechText);
    speech.lang = kannada ? 'kn-IN' : 'en-IN';
    const fallbackVoice = getSpeechVoice(kannada ? 'kn' : 'en');
    if (fallbackVoice) speech.voice = fallbackVoice;
    speech.onstart = () => setSpeaking(true);
    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
    setNotice('Reading your recommendation aloud.');
  };
  const pauseSpeech = () => { if (window.speechSynthesis?.speaking) window.speechSynthesis.pause(); };
  const resumeSpeech = () => { if (window.speechSynthesis?.paused) window.speechSynthesis.resume(); };
  const stopSpeech = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  const downloadBridge = () => {
    const lines = [
      'AI Livelihood Navigator',
      `Name: ${profile.name || 'User'}`,
      `Current work: ${profile.current_work || '-'}`,
      `Skills: ${profile.skills || '-'}`,
      `Goal: ${profile.goal || '-'}`,
      '',
      'Skill Bridge',
      `What you know: ${selected?.bridge_from || '-'}`,
      `What you can become: ${selected?.bridge_to || selected?.title || '-'}`,
      `What you need to learn: ${(selected?.skill_gaps || []).join(', ')}`,
      `Next step: ${selected?.training || '-'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-skill-bridge.txt';
    link.click();
    URL.revokeObjectURL(url);
  };
  return <div className="app-shell"><header className="site-header"><button className="brand" onClick={() => setView('home')}><span className="brand-mark"><Leaf size={19} /></span>AI Livelihood Navigator</button><div className="header-actions"><div className="language-switcher">{['English', 'Kannada'].map((item) => <button key={item} className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>{item}</button>)}</div>{view !== 'home' && <button className="text-button" onClick={() => setView('home')}><X size={16} /> Exit</button>}</div></header><main>{view === 'home' && <Home start={reset} demo={demo} />}{view === 'assessment' && <Assessment step={step} question={questionData} currentQuestionText={currentQuestionText} profile={profile} draft={draft} setDraft={setDraft} transcript={transcript} setTranscript={setTranscript} editing={editing} setEditing={setEditing} listening={listening} notice={notice} chatReply={chatReply} listen={listen} speakQuestion={speakQuestion} submit={submit} back={() => step ? setStep(step - 1) : setView('home')} kannada={kannada} currentPlaceholder={currentPlaceholder} />}{view === 'confirm' && <ProfileConfirmation profile={profile} confirm={confirmProfile} edit={() => { setStep(0); setView('assessment'); }} />}{view === 'results' && <ResultsUpgrade language={language} kannada={kannada} profile={profile} potential={potential} setPotential={setPotential} confirmed={confirmed} setConfirmed={setConfirmed} opportunities={opportunities} selected={selected} setSelected={setSelected} speak={speak} speaking={speaking} pauseSpeech={pauseSpeech} resumeSpeech={resumeSpeech} stopSpeech={stopSpeech} downloadBridge={downloadBridge} notice={notice} restart={reset} />}</main><footer>Built to turn lived experience into a next step.</footer></div>;
}

function Home({ start, demo }) { return <section className="home-page page-grid"><div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> VOICE-BASED SKILL MAPPING</div><h1>Tell us what you know.<br /><em>We’ll show you</em> what you can become.</h1><p className="hero-lede">Tell your story. Discover hidden strengths, a realistic opportunity, and the next skill to learn.</p><div className="hero-actions"><button className="primary-button" onClick={start}><Mic size={19} /> Start Your Journey <ArrowRight size={17} /></button><button className="secondary-button" onClick={demo}><Play size={16} /> Try Demo</button></div><button className="type-link" onClick={start}>Type Instead <ArrowRight size={14} /></button></div><div className="hero-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="bridge-preview"><div className="preview-label">WHAT I KNOW → WHAT I CAN BECOME</div><div className="preview-node"><span className="node-icon leaf-icon"><Leaf size={19} /></span><div><small>You know</small><strong>Farming + Tractor</strong></div></div><div className="bridge-line"><span>→</span></div><div className="preview-node"><span className="node-icon idea-icon"><Lightbulb size={19} /></span><div><small>You can become</small><strong>Equipment Service Provider</strong></div></div><div className="preview-insight"><span>✦</span> Discover the skills hiding in your experience</div></div></div></section>; }

function Assessment({ step, question, currentQuestionText, profile, draft, setDraft, transcript, setTranscript, editing, setEditing, listening, notice, chatReply, listen, speakQuestion, submit, back, kannada, currentPlaceholder }) {
  return (
    <section className="assessment-page page-grid">
      <div className="assessment-intro">
        <button className="back-button" onClick={back}><ChevronLeft size={16} /> {kannada ? 'ಹಿಂದೆ' : 'Back'}</button>
        <div className="eyebrow">{kannada ? 'ನಿಮ್ಮ ಕಥೆಯನ್ನು ಒಂದೊಂದಾಗಿ ಪೂರೈಸೋಣ' : 'YOUR STORY, ONE STEP AT A TIME'}</div>
        <h1>{kannada ? 'ನಿಮ್ಮ ಮುಂದಿನ ದಿಕ್ಕನ್ನು' : 'Let’s find your'}<br /><em>{kannada ? 'ಪತ್ತೆ ಮಾಡೋಣ.' : 'next direction.'}</em></h1>
        <p>{kannada ? 'ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.' : 'Speak naturally. There are no wrong answers.'}</p>
        <LiveProfile profile={profile} current={currentQuestionText} />
      </div>

      <div className="question-panel">
        <div className="question-meta">
          <span>{kannada ? 'ಪ್ರಶ್ನೆ' : 'QUESTION'} {String(step + 1).padStart(2, '0')} / 07</span>
          <div className="progress-track"><i style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
        </div>

        <h2>{currentQuestionText}</h2>

        <button className="secondary-button" onClick={speakQuestion} type="button">
          <Volume2 size={16} /> {kannada ? 'ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿರಿ' : 'Read question aloud'}
        </button>

        <p className="question-hint">
          {kannada ? 'ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.' : 'You can speak or type your answer.'}
        </p>

        {chatReply && <div className="ai-reply"><Sparkles size={15} /> {chatReply}</div>}

        <button className={`listen-button ${listening ? 'is-listening' : ''}`} onClick={listen} type="button">
          <span className="listen-ring"><Mic size={28} /></span>
          <strong>{listening ? (kannada ? 'ಮಾತನಾಡಲಾಗುತ್ತಿದೆ...' : 'Listening...') : (kannada ? 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ' : 'Tap to speak')}</strong>
          <small>{listening ? (kannada ? 'ಮತ್ತೊಮ್ಮೆ ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ' : 'Tap again to stop') : (kannada ? 'ಅಥವಾ ಕೆಳಗಿನ ಪಠ್ಯ ಬಾಕ್ಸ್ ಬಳಸಿ' : 'or use the text box below')}</small>
        </button>

        {transcript && !editing && (
          <div className="transcript">
            <Volume2 size={16} />
            <div>
              <small>{kannada ? 'ನಿಮ್ಮ ಉತ್ತರ' : 'TRANSCRIBED ANSWER'}</small>
              <p>{transcript}</p>
              <button className="edit-transcript" onClick={() => { setEditing(true); setDraft(transcript); }}>
                {kannada ? 'ಪುನಃ ನಮೂದಿಸಿ' : 'Edit transcript'}
              </button>
            </div>
          </div>
        )}

        {editing && (
          <div className="transcript-editor">
            <label>{kannada ? 'ನಾವು ಕೇಳಿದ ವಿಷಯವನ್ನು ಸರಿಪಡಿಸಿ' : 'Correct what we heard'}</label>
            <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setTranscript(event.target.value); }} rows="3" />
            <button className="confirm-skill" onClick={() => setEditing(false)}>
              <Check size={14} /> {kannada ? 'ಉತ್ತರ ಬಳಸಿ' : 'Use corrected answer'}
            </button>
          </div>
        )}

        <form onSubmit={submit} className="answer-form">
          <label htmlFor="answer">{kannada ? 'ನಿಮ್ಮ ಉತ್ತರ' : 'Your answer'}</label>
          <textarea id="answer" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={currentPlaceholder} rows="3" />
          <div className="answer-actions">
            <button className="secondary-button" type="button" onClick={() => setDraft('')}>{kannada ? 'ಅತ್ಯರ್ಥಗೊಳಿಸಿ' : 'Clear'}</button>
            <button className="primary-button" type="submit">{kannada ? 'ಮುಂದೆ' : 'Next'} <ArrowRight size={16} /></button>
          </div>
          {notice && <div className="question-status">{notice}</div>}
        </form>
      </div>
    </section>
  );
}
function ProfileConfirmation({ profile, confirm, edit }) { return <section className="confirmation-page"><div className="confirmation-card"><div className="eyebrow"><Check size={15} /> PROFILE REVIEW</div><h1>We understood your story.</h1><p className="confirmation-lede">Please check these details before we build your Skill Bridge.</p><div className="confirmation-grid">{[['Name', profile.name], ['Education', profile.education], ['Current Work', profile.current_work], ['Experience', profile.experience], ['Skills', profile.skills], ['Interest', profile.interest], ['Goal', profile.goal]].map(([label, value]) => <div className="confirmation-row" key={label}><span>{label}</span><strong>{value || 'Not specified'}</strong></div>)}</div><div className="confirmation-actions"><button className="secondary-button" onClick={edit}>Edit answers</button><button className="primary-button" onClick={confirm}>Yes, create my Skill Bridge <ArrowRight size={16} /></button></div></div></section>; }

function LiveProfile({ profile, current }) { return <div className="live-profile"><div className="section-label">YOUR STORY SO FAR</div><strong className="live-profile-title">Building your profile</strong>{[['Name', profile.name], ['Work', profile.current_work], ['Experience', profile.experience], ['Skills', profile.skills], ['Goal', profile.goal]].map(([label, value]) => <div className="live-row" key={label}><span>{label}</span><strong>{value || <em>Waiting for your answer</em>}</strong></div>)}<small>Next: {current}</small></div>; }

function Results({ profile, potential, setPotential, confirmed, setConfirmed, opportunities, selected, setSelected, speak, notice, restart }) { const skills = (profile.skills || '').split(',').map((item) => item.trim()).filter(Boolean); const current = profile.current_work || skills[0] || 'Your experience'; return <section className="results-page"><div className="results-heading"><div><div className="eyebrow"><Sparkles size={15} /> YOUR PERSONALIZED PATH</div><h1>Here’s where your<br /><em>experience can take you.</em></h1></div><button className="secondary-button" onClick={speak}><Volume2 size={17} /> Listen to My Recommendation</button></div>{notice && <div className="speech-note">{notice}</div>}<div className="results-layout"><aside className="profile-column"><div className="section-label">MY LIVELIHOOD PROFILE</div><div className="profile-card"><div className="profile-avatar">{String(profile.name || 'A').charAt(0).toUpperCase()}</div><div className="profile-name">{profile.name || 'Your profile'}</div><div className="profile-goal">{profile.goal || 'Ready for a new direction'}</div>{[['Education', profile.education], ['Current Work', profile.current_work], ['Experience', profile.experience], ['Interest', profile.interest], ['Goal', profile.goal]].map(([label, value]) => <ProfileRow key={label} label={label} value={value || '-'} />)}</div><div className="section-label existing-label">EXISTING SKILLS</div><div className="skill-list">{skills.map((skill) => <div className="skill-item" key={skill}><Check size={15} /> {skill}</div>)}{confirmed.map((skill) => <div className="skill-item confirmed" key={skill.id}><Check size={15} /> {skill.name}</div>)}</div></aside><div className="results-main"><PotentialSkills skills={potential} setSkills={setPotential} setConfirmed={setConfirmed} />{selected && <SkillBridge current={current} item={selected} />}<div className="section-heading"><div><div className="section-label">OPPORTUNITIES FOR YOU</div><h2>Start with a direction that fits.</h2></div><span className="verified-pill"><Check size={13} /> Only from verified dataset</span></div>{opportunities.length ? <div className="opportunity-grid">{opportunities.slice(0, 3).map((item, index) => <OpportunityCard key={item.id} item={item} index={index} selected={selected?.id === item.id} select={() => setSelected(item)} />)}</div> : <div className="empty-state">No suitable opportunity found in the current opportunity database.</div>}{selected && <Roadmap item={selected} />}<button className="restart-button" onClick={restart}><RotateCcw size={15} /> Start another assessment</button></div></div></section>; }

function ProfileRow({ label, value }) { return <div className="profile-row"><span>{label}</span><strong>{value}</strong></div>; }
function PotentialSkills({ skills, setSkills, setConfirmed }) { return <section className="potential-skills"><div className="section-heading"><div><div className="section-label">POTENTIAL SKILLS IDENTIFIED FROM YOUR EXPERIENCE</div><h2>Skills You May Already Have</h2></div></div>{skills.length ? <div className="potential-grid">{skills.map((skill) => <div className="potential-card" key={skill.id}><div><strong>{skill.name}</strong><p>{skill.reason}</p><small>This is a possibility, not a confirmed fact.</small></div><div className="potential-actions"><button className="confirm-skill" onClick={() => { setConfirmed((items) => [...items, skill]); setSkills((items) => items.filter((item) => item.id !== skill.id)); }}><Check size={14} /> Confirm</button><button className="remove-skill" onClick={() => setSkills((items) => items.filter((item) => item.id !== skill.id))}><X size={14} /></button></div></div>)}</div> : <div className="empty-state">No potential skills identified yet.</div>}</section>; }
function SkillBridge({ current, item }) { return <div className="skill-bridge"><div className="bridge-heading"><div><div className="section-label">YOUR UNIQUE SKILL BRIDGE</div><h2>What you know can open a new door.</h2></div><span className="bridge-tag">NEXT STEP</span></div><div className="bridge-path"><div className="bridge-card"><small>WHAT YOU KNOW</small><strong>{item.bridge_from || current}</strong><span className="bridge-symbol leaf-icon"><Leaf size={21} /></span></div><div className="path-arrow">↕</div><div className="bridge-card highlight"><small>WHAT YOU CAN BECOME</small><strong>{item.bridge_to || item.title}</strong><span className="bridge-symbol idea-icon"><Lightbulb size={21} /></span></div><div className="path-arrow">↕</div><div className="bridge-card need"><small>WHAT YOU NEED TO LEARN</small><strong>{(item.skill_gaps || []).join(' + ')}</strong><span className="bridge-symbol"><Sparkles size={19} /></span></div></div><div className="bridge-next"><span>YOUR NEXT STEP</span><strong>{item.training || item.skill_to_learn}</strong></div></div>; }
function OpportunityCard({ item, index, selected, select }) { return <button className={`opportunity-card ${selected ? 'selected' : ''}`} onClick={select}><div className="card-topline"><span>0{index + 1}</span>{selected && <span className="match-label"><Check size={12} /> Best match</span>}</div><h3>{item.title}</h3><p>{item.summary}</p><div className="why-match"><strong>Why this matches you</strong>{(item.why || item.required_skills || []).map((reason) => <span key={reason}><Check size={13} /> {reason}</span>)}</div><div className="learn-next"><span>SKILL GAPS</span><strong>{(item.skill_gaps || []).join(', ')}</strong></div><div className="source-line">Training: {item.training || item.skill_to_learn} · {item.source || 'Demo Opportunity Dataset'}</div></button>; }
function Roadmap({ item }) { return <div className="roadmap"><div className="section-label">YOUR ROADMAP</div><h2>Learn → Practice → Opportunity.</h2><div className="roadmap-steps">{(item.roadmap || []).map((step, index) => <div className="roadmap-step" key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}</div></div>; }




