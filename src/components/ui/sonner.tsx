// src/components/ui/sonner.tsx

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Como seu app tem um tema escuro fixo, definimos o tema diretamente.
  // Isso remove a dependência 'next-themes' que estava causando o erro.
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-tubepro-darkAccent group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white/60",
          actionButton:
            "group-[.toast]:bg-tubepro-red group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-tubepro-dark group-[.toast]:text-white/80",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };