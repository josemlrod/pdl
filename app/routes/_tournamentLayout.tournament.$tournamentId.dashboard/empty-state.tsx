type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
};

export default function EmptyState({ title, subtitle, icon }: Props) {
  return (
    <div
      className="text-center flex flex-col items-center justify-center"
      style={{ height: "calc(100% - 4px)" }}
    >
      {icon}
      <h3 className="mt-2 text-sm font-semibold">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-sm text-secondary-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
