import { QSOProvider } from "@/contexts/QSOContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QSOProvider>{children}</QSOProvider>;
}
