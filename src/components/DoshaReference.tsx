import React, { useState } from 'react';
import { Wind, Flame, Droplets, X } from 'lucide-react';

export const DoshaReference: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/20 bg-black/40 overflow-hidden shadow-lg mt-3">
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <h4 className="text-xs font-bold text-white font-headline">Ayurvedic Dosha Reference</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-bold">Quick Guide</span>
          <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto scrollbar-hide p-2 space-y-2">
        {/* Vata */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-[#7EBAC0]/20 text-[#7EBAC0]">
              <Wind className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-[#7EBAC0] text-sm">Vata (Air + Space)</h5>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            <strong>Qualities:</strong> Dry, light, cold, rough, subtle, mobile.<br/>
            <strong>Physical:</strong> Thin build, dry skin, sensitive digestion, active.<br/>
            <strong>Imbalance:</strong> Anxiety, insomnia, digestive issues, dry skin, fatigue.<br/>
            <strong>Balancing:</strong> Routine, warmth, grounding foods (sweet, sour, salty), meditation.
          </p>
        </div>

        {/* Pitta */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-[#D4AF37]/20 text-[#D4AF37]">
              <Flame className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-[#D4AF37] text-sm">Pitta (Fire + Water)</h5>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            <strong>Qualities:</strong> Hot, sharp, light, liquid, spreading.<br/>
            <strong>Physical:</strong> Medium build, warm skin, strong digestion, intense focus.<br/>
            <strong>Imbalance:</strong> Anger, inflammation, heartburn, skin rashes, overworking.<br/>
            <strong>Balancing:</strong> Cooling foods (sweet, bitter, astringent), moderation, nature walks, avoiding spicy/fried foods.
          </p>
        </div>

        {/* Kapha */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-[#4E8975]/20 text-[#4E8975]">
              <Droplets className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-[#4E8975] text-sm">Kapha (Earth + Water)</h5>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            <strong>Qualities:</strong> Heavy, slow, cool, oily, smooth, dense, stable.<br/>
            <strong>Physical:</strong> Solid build, smooth skin, slow digestion, calm nature.<br/>
            <strong>Imbalance:</strong> Lethargy, weight gain, congestion, attachment, depression.<br/>
            <strong>Balancing:</strong> Stimulation, exercise, light/spicy foods (pungent, bitter, astringent), variety in routine.
          </p>
        </div>
      </div>
    </div>
  );
};
