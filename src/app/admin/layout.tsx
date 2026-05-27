export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-carvao text-creme font-sans">
      {children}
    </div>
  );
}
