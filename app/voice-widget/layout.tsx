export default function VoiceWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full bg-transparent">{children}</div>;
}
