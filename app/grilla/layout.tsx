import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cockpit Operativo · @tuprofeindustrial",
  description: "Panel interno de programación, seguimiento y recursos PAES M1.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Grilla TPI",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GrillaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
