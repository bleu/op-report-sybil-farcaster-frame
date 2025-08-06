export const GraphLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4 min-h-[300px] h-full">
      <h2 className="text-2xl font-bold w-full text-center">{title}</h2>
      <div className="h-full px-8">{children}</div>
    </div>
  );
};
