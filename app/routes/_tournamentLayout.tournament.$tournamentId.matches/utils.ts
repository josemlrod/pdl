import moment from "moment-timezone";
import { type Player, type Match } from "~/services/firebase";

export function sortDates(dateStrings: Array<string>) {
  const dateObjects = dateStrings.map((dateString) => new Date(dateString));
  dateObjects.sort((a: Date, b: Date) => a.valueOf() - b.valueOf());
  return dateObjects.map((date) =>
    moment(date).tz("America/New_York").format("L")
  );
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

export function getPlayerNames(players: Player[]) {
  return players.map((p) => p.name);
}
