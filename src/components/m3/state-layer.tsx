'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type M3SurfacePair =
  | 'primary'
  | 'primaryContainer'
  | 'secondaryContainer'
  | 'surface'
  | 'surfaceVariant'
  | 'error'
  | 'inverseSurface';

const LAYER_STYLES: Record<
  M3SurfacePair,
  {
    foreground: string;
    hover: string;
    focus: string;
    pressed: string;
    dragged: string;
  }
> = {
  primary: {
    foreground: 'var(--md-sys-color-on-primary)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  primaryContainer: {
    foreground: 'var(--md-sys-color-on-primary-container)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  secondaryContainer: {
    foreground: 'var(--md-sys-color-on-secondary-container)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  surface: {
    foreground: 'var(--md-sys-color-on-surface)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  surfaceVariant: {
    foreground: 'var(--md-sys-color-on-surface-variant)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  error: {
    foreground: 'var(--md-sys-color-on-error)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
  inverseSurface: {
    foreground: 'var(--md-sys-color-inverse-on-surface)',
    hover: '0.08',
    focus: '0.10',
    pressed: '0.10',
    dragged: '0.16',
  },
};

export interface M3StateLayerProps {
  pair?: M3SurfacePair;
  /** Optional explicit override for §2.2 0% state-layer pairs */
  disabledLayer?: boolean;
  className?: string;
}

/**
 * Returns CSS custom properties for `.m3-control` to drive `.m3-state-layer`
 * per M3_SPEC.md §2.2 without stacking ripples.
 */
export function getM3LayerVars(pair: M3SurfacePair = 'surface', disabledLayer = false): React.CSSProperties {
  const cfg = LAYER_STYLES[pair];
  return {
    '--m3-layer-foreground': cfg.foreground,
    '--m3-layer-hover': disabledLayer ? '0' : cfg.hover,
    '--m3-layer-focus': disabledLayer ? '0' : cfg.focus,
    '--m3-layer-pressed': disabledLayer ? '0' : cfg.pressed,
    '--m3-layer-dragged': disabledLayer ? '0' : cfg.dragged,
  } as React.CSSProperties;
}

export function M3StateLayer({ className }: M3StateLayerProps) {
  return <span aria-hidden="true" className={cn('m3-state-layer', className)} />;
}
