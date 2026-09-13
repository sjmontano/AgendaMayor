import type { ButtonHTMLAttributes } from 'react';
import { btn } from '@/lib/design-tokens';

type Variante = 'primary' | 'secondary' | 'ghost';
type Tamano = 'sm' | 'md' | 'lg';

interface BtnMayorProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
}

/**
 * Botón institucional Agenda Mayor.
 * Estados: default, hover, focus-visible (global), active (press), disabled, loading (ver LoadingButton).
 * Teclado: nativo <button> — Enter/Espacio activan, Tab alcanza, focus siempre visible.
 */
export function BtnMayor({
  variante = 'primary',
  tamano = 'md',
  className = '',
  ...props
}: BtnMayorProps) {
  return (
    <button
      className={`${btn[variante]} ${btn[tamano]} ${className}`}
      {...props}
    />
  );
}
