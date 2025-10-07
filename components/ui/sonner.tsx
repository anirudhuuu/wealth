"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={true}
      closeButton={true}
      offset="16px"
      gap={8}
      toastOptions={{
        style: {
          background: "hsl(var(--popover) / 0.95)",
          color: "hsl(var(--popover-foreground))",
          border: "1px solid hsl(var(--border) / 0.5)",
          borderRadius: "calc(var(--radius) - 2px)",
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          backdropFilter: "blur(8px)",
        },
        duration: 4000,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--popover) / 0.95)",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border) / 0.5)",
          "--success-bg": "hsl(var(--popover) / 0.95)",
          "--success-text": "hsl(var(--popover-foreground))",
          "--success-border": "hsl(var(--border) / 0.5)",
          "--error-bg": "hsl(var(--popover) / 0.95)",
          "--error-text": "hsl(var(--popover-foreground))",
          "--error-border": "hsl(var(--border) / 0.5)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
