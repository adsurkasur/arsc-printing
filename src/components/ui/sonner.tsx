import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Sonner Toaster styled per M3_SPEC.md §5 (Toast / Snackbar anatomy):
 * Container: inverseSurface, min-h 56, radius 12, p 16, shadow elevation-3
 * Body: inverseOnSurface, font 14 regular
 * Icon: 20x20
 * Action: inversePrimary font 14 medium
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--md-sys-color-inverse-surface)] group-[.toaster]:text-[var(--md-sys-color-inverse-on-surface)] group-[.toaster]:border-transparent group-[.toaster]:rounded-m group-[.toaster]:min-h-[56px] group-[.toaster]:p-space4 group-[.toaster]:shadow-elevation-3 group-[.toaster]:text-sm group-[.toaster]:font-body",
          description: "group-[.toast]:text-[var(--md-sys-color-inverse-on-surface)]/80 text-xs",
          actionButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-[var(--md-sys-color-inverse-primary)] group-[.toast]:font-medium group-[.toast]:hover:underline",
          cancelButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-[var(--md-sys-color-inverse-on-surface)]/70",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5 group-[.toast]:text-[var(--md-sys-color-inverse-primary)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
