import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * ColorModeBadge
 * @param mode - 'bw' | 'color'
 */
export default function ColorModeBadge({ mode }: { mode: 'bw' | 'color' }) {
  if (mode === 'bw') {
    return <Badge variant="outline" className="rounded-lg">B/W</Badge>;
  }
  return (
    <Badge variant="outline" className="rounded-lg text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border-blue-200/40">
      Warna
    </Badge>
  );
}