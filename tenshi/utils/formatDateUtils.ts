export function formatDate(date: Date): string {
    const pad = (num: number) => String(num).padStart(2, '0');
  
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  

export function formatNormalDate(date: Date | string): string {
  const realDate =
    typeof date === "string"
      ? new Date(date + "T00:00:00") // fuerza interpretación local
      : date;

  const day = realDate.getDate().toString().padStart(2, "0");
  const month = (realDate.getMonth() + 1).toString().padStart(2, "0");
  const year = realDate.getFullYear();

  return `${day}-${month}-${year}`;
}



export function format12Hour(timeString: string): string {
  const [hourStr, minuteStr] = timeString.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
