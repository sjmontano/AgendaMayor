# Referencias de motion — Agenda Mayor

Componentes aportados por el equipo como punto de partida. **No se copian tal cual**: se adaptan según DESIGN.md §7 (tokens, accesibilidad, `prefers-reduced-motion`, tiempos).

Dependencias necesarias al implementarlos: `motion` (import `motion/react`), `lucide-react`, `clsx` + `tailwind-merge` (helper `cn` en `src/lib/utils.ts`).

Fuente adicional: librería ReUI en 21st.dev — https://21st.dev/@sean0205/library/reui (componentes shadcn-compatibles; adaptar igual que estos).

## 1. MotionDrawer (menú lateral con drag)

Uso previsto: menú móvil del navbar (< 1024px) y panel de filtros de la vitrina en móvil.

Ajustes obligatorios al adaptarlo:
- `backgroundColor` / `overlayColor` por tokens (`bg-surface`, `bg-unimayor-deep/40`), nunca hex.
- Botones con `aria-label` ("Abrir menú" / "Cerrar menú"), `aria-expanded`, `aria-controls`.
- Drawer con `role="dialog"`, `aria-modal="true"`, focus trap, cierre con Escape y retorno del foco al botón.
- `useReducedMotion()`: sin spring ni drag-animado, solo fade.
- `z-99` / `z-9999` → escala de z-index definida en tokens.

```tsx
'use client';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';

export type SideMenuDirection = 'left' | 'right';
export type ButtonOpeningVariants = 'push' | 'merge' | 'stay';

interface SideMenuProps {
  // Appearance
  overlayColor?: string;
  width?: number;
  direction?: SideMenuDirection;
  backgroundColor?: string;

  // Content
  children: React.ReactNode;

  // Behavior
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  showToggleButton?: boolean;
  toggleButtonText?: {
    open: string;
    close: string;
  };

  // Styling
  btnClassName?: string;
  className?: string;
  contentClassName?: string;
  clsBtnClassName?: string;
  overlayClassName?: string;

  // Animation
  animationConfig?: {
    type?: 'spring' | 'tween';
    damping?: number;
    stiffness?: number;
    duration?: number;
  };

  // Drag behavior
  enableDrag?: boolean;
  dragThreshold?: number;

  // New prop
  buttonOpeningVariants?: ButtonOpeningVariants;
}

const getOpenButtonVariants = (
  direction: SideMenuDirection,
  width: number,
  type: ButtonOpeningVariants
) => {
  switch (type) {
    case 'merge':
      return direction === 'left'
        ? {
            closed: { x: 0, opacity: 1, scale: 1, borderRadius: '0.5rem' },
            open: {
              x: width - 68,
              opacity: 0,
              scale: 1,
              borderRadius: '0rem',
            },
          }
        : {
            closed: { x: 0, opacity: 1, scale: 1, borderRadius: '0.5rem' },
            open: {
              x: 68 - width,
              opacity: 0,
              scale: 1,
              borderRadius: '0rem',
            },
          };

    case 'push':
      return direction === 'left'
        ? { closed: { x: 0, opacity: 1 }, open: { x: width + 20, opacity: 0 } }
        : {
            closed: { x: 0, opacity: 1 },
            open: { x: -(width + 20), opacity: 0 },
          };

    case 'stay':
    default:
      return {
        closed: { x: 0, opacity: 1 },
        open: { x: 0, opacity: 0 },
      };
  }
};

const MotionDrawer: React.FC<SideMenuProps> = ({
  // Appearance
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  width = 250,
  direction = 'left',
  backgroundColor = '#ffffff',

  // Content
  children,

  // Behavior
  isOpen: controlledIsOpen,
  onToggle,
  showToggleButton = true,

  // Styling
  btnClassName = '',
  clsBtnClassName = '',
  className = '',
  contentClassName = '',
  overlayClassName = '',

  // Animation
  animationConfig = {
    type: 'spring',
    damping: 25,
    stiffness: 120,
  },

  // Drag behavior
  enableDrag = true,
  dragThreshold = 0.3,

  buttonOpeningVariants = 'merge',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    }
    onToggle?.(value);
  };

  const getDrawerVariants = () => {
    if (direction === 'left') {
      return {
        closed: { x: -width },
        open: { x: 0 },
      };
    } else {
      return {
        closed: { x: width },
        open: { x: 0 },
      };
    }
  };

  const buttonVariants = getOpenButtonVariants(direction, width, buttonOpeningVariants);

  const getDragConstraints = () => {
    if (direction === 'left') {
      return { left: -width, right: 0 };
    } else {
      return { left: 0, right: width };
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (!enableDrag) return;

    const threshold = width * dragThreshold;
    const dragDistance = Math.abs(info.offset.x);

    if (direction === 'left') {
      const isDraggingLeft = info.offset.x < 0;
      if (isDraggingLeft && dragDistance > threshold && isOpen) {
        setIsOpen(false);
      } else if (!isDraggingLeft && dragDistance > threshold && !isOpen) {
        setIsOpen(true);
      }
    } else {
      const isDraggingRight = info.offset.x > 0;
      if (isDraggingRight && dragDistance > threshold && isOpen) {
        setIsOpen(false);
      } else if (!isDraggingRight && dragDistance > threshold && !isOpen) {
        setIsOpen(true);
      }
    }
  };

  const drawerPositionClasses = direction === 'left' ? 'left-0' : 'right-0';
  const openButtonPositionClasses = direction === 'left' ? 'top-4 left-4' : 'top-4 right-4';

  return (
    <>
      {showToggleButton && (
        <motion.button
          className={cn(
            `fixed z-99 text-primary cursor-pointer ${openButtonPositionClasses}`,
            btnClassName
          )}
          onClick={() => setIsOpen(true)}
          variants={buttonVariants}
          animate={isOpen ? 'open' : 'closed'}
          transition={animationConfig}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu />
          {/* Open */}
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className={`fixed w-full h-full top-0 left-0 z-9999 ${className}`}>
            {/* Overlay */}
            <motion.div
              className={`absolute w-full h-full top-0 left-0 ${overlayClassName}`}
              style={{ backgroundColor: overlayColor }}
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Drawer */}
            <motion.div
              className={`absolute h-full shadow-[8px_1px_21px_0px_rgba(17,17,26,0.1)] ${drawerPositionClasses} ${contentClassName}`}
              style={{
                backgroundColor,
                width: `${width}px`,
                padding: '60px 30px 30px 30px',
                boxSizing: 'border-box',
              }}
              drag={enableDrag ? 'x' : false}
              dragElastic={0.1}
              dragConstraints={getDragConstraints()}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              variants={getDrawerVariants()}
              initial='closed'
              animate='open'
              exit='closed'
              transition={animationConfig}
            >
              {/* Close Button */}
              {showToggleButton && (
                <motion.button
                  className={cn(
                    'absolute top-2 right-8 p-2 text-foreground cursor-pointer',
                    clsBtnClassName
                  )}
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} /> {/* Close */}
                </motion.button>
              )}

              {/* Content */}
              <div className='h-full overflow-y-auto'>{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MotionDrawer;
```

## 2. TimelineAnimation (reveal secuencial al entrar en viewport)

Uso previsto: hero, encabezados de sección, grids de cards (stagger), timeline de estados del proyecto (BORRADOR → EN_REVISION → PUBLICADO).

Ajustes obligatorios al adaptarlo:
- `delay: i * 0.5` es demasiado lento para grids: usar `i * 0.08` (máx. ~0.4s acumulado); `0.5` solo para narrativa del hero.
- `blur(20px)` → `blur(8px)` como máximo (coste de pintura en móvil gama media).
- Agregar `y: 16 → 0` (consistente con `.reveal` de `globals.css`).
- Con `useReducedMotion()` mostrar contenido visible sin animación.
- Nunca ocultar contenido crítico para LCP (título del hero visible sin JS).

```tsx
import type { Variants } from 'motion/react';
import { type HTMLMotionProps, motion, useInView } from 'motion/react';
import type React from 'react';

type TimelineContentProps<T extends keyof HTMLElementTagNameMap> = {
  children?: React.ReactNode;
  animationNum: number;
  className?: string;
  timelineRef: React.RefObject<HTMLElement | null>;
  as?: T;
  customVariants?: Variants;
  once?: boolean;
} & HTMLMotionProps<T>;

export const TimelineAnimation = <T extends keyof HTMLElementTagNameMap = 'div'>({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: TimelineContentProps<T>) => {
  const defaultSequenceVariants = {
    visible: (i: number) => ({
      filter: 'blur(0px)',
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(20px)',
      y: 0,
      opacity: 0,
    },
  };

  const sequenceVariants = customVariants || defaultSequenceVariants;

  const isInView = useInView(timelineRef, {
    once,
  });

  const MotionComponent = motion[as || 'div'] as React.ElementType;

  return (
    <MotionComponent
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      custom={animationNum}
      variants={sequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
```
