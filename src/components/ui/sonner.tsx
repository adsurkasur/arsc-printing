import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Sonner Toaster styled per M3_SPEC.md §5 (Toast / Snackbar anatomy):
 * - Container: inverseSurface, min-h 56, radius 12, p 16, shadow elevation-3
 * - Body: inverseOnSurface, font 14 regular (no opacity reduction)
 * - Icon: 20x20
 * - Action: inversePrimary font 14 medium
 * - Hit target: close 48x48 inside trailing edge, no hanging ring
 * - Stacking: visibleToasts 3
 * - Position: mobile top 80px + safe area; desktop top-right 24px below appbar (88px) and 24px from right edge
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group !z-[80]"
      position="top-right"
      offset={{ top: 88, right: 24 }}
      mobileOffset={{ top: 80, right: 16, left: 16 }}
      visibleToasts={3}
      closeButton={true}
      pauseWhenPageIsHidden={true}
      style={{ "--width": "min(400px, calc(100vw - 32px))" } as React.CSSProperties}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:!flex group-[.toaster]:!items-center group-[.toaster]:!gap-space3 group-[.toaster]:bg-[var(--md-sys-color-inverse-surface)] group-[.toaster]:text-[var(--md-sys-color-inverse-on-surface)] group-[.toaster]:border-transparent group-[.toaster]:rounded-m group-[.toaster]:min-h-[56px] group-[.toaster]:p-space4 group-[.toaster]:shadow-elevation-3 group-[.toaster]:text-sm group-[.toaster]:font-body",
          description: "group-[.toast]:text-[var(--md-sys-color-inverse-on-surface)] text-xs",
          actionButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-[var(--md-sys-color-inverse-primary)] group-[.toast]:font-medium group-[.toast]:hover:underline group-[.toast]:min-h-[48px] group-[.toast]:px-3",
          cancelButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-[var(--md-sys-color-inverse-on-surface)] group-[.toast]:min-h-[48px] group-[.toast]:px-3",
          closeButton:
            "group-[.toast]:!static group-[.toast]:!order-last group-[.toast]:!ml-auto group-[.toast]:!transform-none group-[.toast]:!border-0 group-[.toast]:!shadow-none group-[.toast]:!w-12 group-[.toast]:!h-12 group-[.toast]:!shrink-0 group-[.toast]:!flex group-[.toast]:!items-center group-[.toast]:!justify-center group-[.toast]:!rounded-full group-[.toast]:!bg-transparent group-[.toast]:!text-[var(--md-sys-color-inverse-on-surface)]",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5 group-[.toast]:shrink-0 group-[.toast]:text-[var(--md-sys-color-inverse-primary)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
