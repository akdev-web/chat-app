export default function DateStringtoLocalTime(dateString){
    if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // 12-hour format with AM/PM
  });
}