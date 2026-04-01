import React from 'react';
import { Lock } from 'lucide-react';

export const PremiumBadge = ({ inline = false }: { inline?: boolean }) => (
  <div className={`${inline ? 'relative inline-flex' : 'absolute -top-2 -right-2'} bg-gradient-to-r from-[#FF0080] to-[#7928CA] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-purple-500/20 flex items-center gap-0.5 z-10`}>
    <Lock className="w-2 h-2" />
    PRO
  </div>
);
