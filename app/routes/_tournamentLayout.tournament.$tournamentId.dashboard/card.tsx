type Props = {
  body: React.ReactNode;
  header: React.ReactNode;
  styles: React.CSSProperties;
};

export default function CardLayout({ body, header, styles }: Props) {
  return (
    <div
      className="divide-y overflow-hidden rounded-lg shadow flex flex-col h-fit border"
      style={styles}
    >
      <div className="px-2 py-3 sm:px-4">{header}</div>
      <div className="px-2 py-5 sm:p-4 flex grow h-auto">{body}</div>
    </div>
  );
}
