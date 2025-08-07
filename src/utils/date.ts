export const formatDate = (date: string, dateFormat: "day" | "week" | "month" | "year") => {
  switch (dateFormat) {
    case "day":
      return new Date(date).toLocaleDateString('en-US', { day: 'numeric' });
    case "week":
      return `${getWeekStart(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getWeekEnd(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case "month":
      return new Date(date).toLocaleDateString('en-US', { month: 'short' });
    case "year":
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric' });
  }
};

export const getWeekStart = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(dateObj.setDate(diff));
};

export const getWeekEnd = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1) + 6;
  return new Date(dateObj.setDate(diff));
};