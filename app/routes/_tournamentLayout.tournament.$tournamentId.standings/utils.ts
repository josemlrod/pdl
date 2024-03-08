import { type Player } from "~/services/firebase";
import { sortPlayers } from "~/services/utils";

const groupAPlayerIds = [
  "7b0e0ff8-95fb-4fb4-a686-b1ddf02fcec6",
  "2b13fd22-70d8-4597-9305-3e6fb4e3bc07",
  "b97e9630-cccd-4ed6-9e46-ee204cd73e0e",
  "620365fa-62d6-4a6e-9170-f558f4a2dcae",
  "8d9057fb-925f-42d1-989f-0a883488e7bc",
  "8635bf25-c1a6-482a-b911-adc3df08e639",
];

const groupBPlayerIds = [
  "5e368bbe-2300-4226-b663-48426bf276bf",
  "ec6abf03-e75f-4524-b634-e71fec73fac6",
  "d167e65a-6f5e-4d95-9038-e9a0a8a5f8cf",
  "7e5177cc-161f-45c0-acf3-c7f4f4d50591",
  "3575b97b-e180-48ea-8952-5f03ff23be84",
  "f79ed181-f9ca-4a02-b2b4-9090993818e0",
  "245f9051-18e7-4d14-a339-9b005cdf4a7e",
];

export function getGroupAPlayers(players: Player[]) {
  const p = players
    .map((p: Player) => (groupAPlayerIds.includes(p.id) && p) || null)
    .filter(Boolean);
  return p;
}

export function getGroupBPlayers(players: Player[]) {
  return players
    .map((p: Player) => (groupBPlayerIds.includes(p.id) && p) || null)
    .filter(Boolean);
}

export function getGroupTopPlayers(players: Player[]) {
  const p = getGroupAPlayers(players);
  const [firstPl, secondPl, thirdPl, fourthPl] = sortPlayers(p);
  return {
    firstPl,
    secondPl,
    thirdPl,
    fourthPl,
  };
}
