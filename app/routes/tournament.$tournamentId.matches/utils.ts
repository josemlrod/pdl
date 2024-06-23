import { type Match } from "~/services/firebase";

export function sortDates(dateStrings: Array<string>) {
  const dateObjects = dateStrings.map((dateString) => new Date(dateString));
  dateObjects.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
  return dateObjects.map((date) => date.toLocaleDateString());
}

export function groupMatchesByDate(matches: Array<Match>) {
  const result: { [key: string]: Array<Match> } = {};
  for (const match of matches) {
    if (result[match.playedOn]) {
      result[match.playedOn].push(match);
      continue;
    }

    result[match.playedOn] = [match];
  }

  return result;
}
