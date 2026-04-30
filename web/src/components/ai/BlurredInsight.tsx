'use client';

import React from 'react';
import { Lock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BlurredInsightProps {
  title: string;
  teaserText: string;
  lockedText: string;
  tierRequired: 'Business' | 'Pro';
}

export const BlurredInsight: React.FC<BlurredInsightProps> = ({
  title,
  teaserText,
  lockedText,
  tierRequired,
}) => {
  return (
    <Card className="relative overflow-hidden border-amber-200 bg-amber-50/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-600" />
          <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wider">{title}</h4>
        </div>
        
        <p className="text-slate-800 font-medium mb-2">{teaserText}</p>
        
        <div className="relative">
          <p className="text-slate-400 blur-[4px] select-none">
            {lockedText}
          </p>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-amber-100 flex items-center gap-2">
              <Lock className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">
                Upgrade ke {tierRequired} untuk membuka analisa ini
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
