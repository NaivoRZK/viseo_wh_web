interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between mb-6 bg-white -mx-8 px-8 pt-4 -mt-8 pb-4 border-b border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
