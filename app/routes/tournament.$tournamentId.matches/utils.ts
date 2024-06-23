export function sortDates(dateStrings: Array<string>) {
  const dateObjects = dateStrings.map((dateString) => new Date(dateString));
  dateObjects.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
  return dateObjects.map((date) => date.toLocaleDateString());
}
