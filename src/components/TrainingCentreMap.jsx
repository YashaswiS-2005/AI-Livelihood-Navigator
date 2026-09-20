import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, Users, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import AudioSpeechPlayer from './AudioSpeechPlayer';

export default function TrainingCentreMap({ locationName = 'Bengaluru', trade = 'Electrician', soundEnabled = true, onSelectCentre }) {
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNearbyCentres();
  }, [locationName, trade]);

  const fetchNearbyCentres = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/centres/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: locationName || 'Bengaluru',
          trade: trade || 'Electrician'
        })
      });
      const data = await res.json();
      setCentres(data.nearby_centres || []);
      if (data.nearby_centres && data.nearby_centres.length > 0) {
        setSelectedCentre(data.nearby_centres[0]);
      }
    } catch (err) {
      console.warn('Centres fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              GPS Nearest Training Centre Finder
            </h2>
            <p className="text-xs text-slate-400">
              Verified PMKVY & State institutes near <span className="text-emerald-300 font-semibold">{locationName}</span> for <span className="text-indigo-300 font-semibold">{trade}</span>
            </p>
          </div>
        </div>

        {selectedCentre && (
          <AudioSpeechPlayer text={selectedCentre.readout_script} soundEnabled={soundEnabled} autoPlay={false} />
        )}
      </div>

      {/* Grid view of centres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centres.map((item, idx) => {
          const { centre, distance_km } = item;
          const isSelected = selectedCentre?.centre.centre_id === centre.centre_id;

          return (
            <div
              key={idx}
              onClick={() => setSelectedCentre(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> {distance_km} km away
                </span>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {centre.open_seats} Open Seats
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1">
                {centre.name}
              </h3>

              <p className="text-xs text-slate-400 mb-3 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{centre.address}</span>
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Phone className="w-3 h-3 text-indigo-400" /> {centre.contact_phone}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectCentre) onSelectCentre(centre);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all"
                >
                  Select for Application
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
