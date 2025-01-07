export const Spinner = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`h-5 w-5 border-[3px] border-gray-200 border-t-gray-400 rounded-full animate-spin ${className}`}
    />
  );
};
