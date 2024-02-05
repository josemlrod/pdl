import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

import { getErrorMessage } from "./utils";

const firebaseConfig = {
  apiKey: "AIzaSyDOyFMdG1qKZyEU4Rxk6X6W4YC_xSwdlfo",
  authDomain: "pkmn-dl.firebaseapp.com",
  projectId: "pkmn-dl",
  storageBucket: "pkmn-dl.appspot.com",
  messagingSenderId: "398363711856",
  appId: "1:398363711856:web:3220cc7cc10468989357b5",
  measurementId: "G-DNVHQWJKFV",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
export const auth = getAuth(app);

type Tournament = {
  format: string;
  id: string;
  name: string;
  player_num: string;
  players: Player[];
};

type AddTournamentProps = Omit<Tournament, "players">;

export type Player = {
  id: string;
  initialDraftPoints: number;
  name: string;
  pokemon: Pokemon[];
  previousPokemon: Pokemon[];
  record: {
    loses: number;
    wins: number;
  };
  team_name: string;
  transactions: Transaction[];
  isHidden?: boolean;
};

type UpdatePlayer = { tournamentId: string; id: string } & Partial<Player>;

type Pokemon = {
  githubName: string;
  id: string;
  name: string;
  pts: string;
  record: {
    faints: number;
    kills: number;
  };
};

type UpdatePlayerPokemonProps = {
  tournamentId: string;
  playerId: string;
  pokemon: Partial<Pokemon>;
};

type Transaction = {
  in: string;
  out: string;
  player_name: string;
  type: "Transfer" | "Tera captain";
};

type Match = {
  date: Date;
  id: string;
  playerNames: [string, string];
  pokemonTeams: {
    [key: string]: Array<string>;
  };
  results: {
    [key: string]: Array<Pokemon>;
  };
  userRecords: {
    [key: string]: {
      loses: number;
      wins: number;
    };
  };
  winner: Player;
};

type AddMatchProps = { tournamentId: string; matchId: string } & Partial<Match>;

export async function AddUser({
  email,
  displayName,
  userId,
}: {
  email: string;
  displayName: string;
  userId: string;
}) {
  try {
    await setDoc(doc(db, "app_users", userId), {
      id: userId,
      email,
      displayName,
    });
    return {
      ok: true,
    };
  } catch (e) {
    return getErrorMessage(e);
  }
}

export async function AddPlayer({ id, tournamentId, ...rest }: UpdatePlayer) {
  try {
    const { data } = (await ReadPlayer({ tournamentId, playerId: id })) || {};
    const playerExists = data && Object.entries(data).length;
    const tournamentDocRef = doc(db, "tournaments", tournamentId);

    if (playerExists) {
      const tournamentDocSnap = await getDoc(tournamentDocRef);
      const tournament = tournamentDocSnap.data();
      const players = tournament && tournament.players;
      const newPlayers = players.map((p: Player) => {
        if (p.id === id) {
          return {
            ...p,
            ...rest,
          };
        }
        return p;
      });
      await updateDoc(tournamentDocRef, {
        players: newPlayers,
      });
    } else {
      await updateDoc(tournamentDocRef, {
        players: arrayUnion({
          id,
          ...rest,
          initialDraftPoints: 120,
          record: {
            loses: 0,
            wins: 0,
          },
          pokemon: [],
          previousPokemon: [],
          transactions: [],
        }),
      });

      return { success: true };
    }
  } catch (e) {
    getErrorMessage(e);
  }
}

async function ReadPlayer({
  tournamentId,
  playerId,
}: {
  tournamentId: string;
  playerId: string;
}) {
  try {
    const tournamentDocRef = doc(db, "tournaments", tournamentId);
    const tournamentDocSnap = await getDoc(tournamentDocRef);
    if (tournamentDocSnap.exists()) {
      const tournament = tournamentDocSnap.data();
      const players = tournament.players;
      const player =
        players &&
        Array.isArray(players) &&
        players.find((p) => p.id === playerId);

      return { success: true, data: player ?? null };
    }
  } catch (e) {
    getErrorMessage(e);
  }
}

export async function ReadPlayers({ tournamentId }: { tournamentId: string }) {
  try {
    const tournamentDocRef = doc(db, "tournaments", tournamentId);
    const tournamentDocSnap = await getDoc(tournamentDocRef);
    const tournament = tournamentDocSnap.data();
    const players = tournament?.players;
    return {
      success: true,
      data: players,
    };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function ReadPlayerByName({
  name,
  tournamentId,
}: {
  name: string;
  tournamentId: string;
}) {
  try {
    const { data: players } = (await ReadPlayers({ tournamentId })) || {};
    const [player] = players.filter((p: Player) => p.name === name);

    return { success: true, data: player };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function ReadUser({ userId }: { userId: string }) {
  try {
    const docRef = doc(db, "app_users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ok: true,
        data: docSnap.data(),
      };
    } else {
      return {
        ok: true,
        data: null,
      };
    }
  } catch (e) {
    return getErrorMessage(e);
  }
}

export async function AddTournament({ id, ...rest }: AddTournamentProps) {
  try {
    const readTournamentResponse = await ReadTournament({ id });
    const tournamentExists =
      readTournamentResponse &&
      typeof readTournamentResponse !== "string" &&
      readTournamentResponse.data &&
      Object.entries(readTournamentResponse.data).length;

    if (tournamentExists) {
      await setDoc(doc(db, "tournaments", id), {
        id,
        ...readTournamentResponse.data,
        ...rest,
      });
    } else {
      await setDoc(doc(db, "tournaments", id), {
        id,
        ...rest,
        start_date: Date.now(),
        end_date: null,
        players: [],
        matches: [],
      });
    }

    return { success: true };
  } catch (error) {
    return getErrorMessage(error);
  }
}

export async function ReadTournament({ id }: { id: string }) {
  try {
    const docRef = doc(db, "tournaments", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ok: true, data: docSnap.data() };
    } else {
      return { ok: true, data: {} };
    }
  } catch (error) {
    return getErrorMessage(error);
  }
}

export async function ReadTournaments() {
  try {
    const tournaments: Tournament[] = [];
    const querySnapshot = await getDocs(collection(db, "tournaments"));
    querySnapshot.forEach((doc) => {
      const { format, id, name, player_num, players } = doc.data();
      tournaments.push({
        format,
        id,
        name,
        player_num,
        players,
      });
    });
    return {
      success: true,
      data: tournaments,
    };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function ReadTransactions({
  tournamentId,
}: {
  tournamentId: string;
}) {
  try {
    const transactions: Array<Transaction>[] = [];
    const { data: players } = (await ReadPlayers({ tournamentId })) || {};
    players.forEach((p: Player) => transactions.push(p.transactions));
    return {
      success: true,
      data: transactions.flat(),
    };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function UpdatePlayerPokemon({
  tournamentId,
  playerId,
  pokemon: { githubName, name, pts },
}: UpdatePlayerPokemonProps) {
  try {
    const { data: player } =
      (await ReadPlayer({ tournamentId, playerId })) || {};
    let playerPokemon = player?.pokemon;

    if (playerPokemon && Array.isArray(playerPokemon)) {
      playerPokemon = [
        ...playerPokemon,
        {
          githubName,
          name,
          id: uuidv4(),
          pts,
          record: {
            faints: 0,
            kills: 0,
          },
        },
      ];
    } else {
      playerPokemon = [
        {
          githubName,
          name,
          id: uuidv4(),
          pts,
          record: {
            faints: 0,
            kills: 0,
          },
        },
      ];
    }

    const newPlayer = { ...player, pokemon: playerPokemon };

    await AddPlayer({
      tournamentId,
      playerId,
      ...newPlayer,
    });

    return { success: true, data: newPlayer };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function AddMatch({
  tournamentId,
  matchId,
  ...rest
}: AddMatchProps) {
  try {
    const { data } = (await ReadMatch({ tournamentId, matchId })) || {};
    const matchExists = data && Object.entries(data).length;

    const tournamentDocRef = doc(db, "tournaments", tournamentId);
    const tournamentDocSnap = await getDoc(tournamentDocRef);
    const tournament = tournamentDocSnap.data();
    const matches = tournament.matches;

    if (matchExists) {
      const newMatches = matches.map((m: Match) => {
        if (m.id === matchId) {
          return {
            ...m,
            ...rest,
          };
        }
        return m;
      });
      await updateDoc(tournamentDocRef, {
        matches: newMatches,
      });
    } else {
      await updateDoc(tournamentDocRef, {
        matches: arrayUnion({
          id: matchId,
          ...rest,
        }),
      });

      return { success: true };
    }

    return { id: matchId, success: true };
  } catch (error) {
    getErrorMessage(error);
  }
}

export async function ReadMatch({
  tournamentId,
  matchId,
}: {
  tournamentId: string;
  matchId: string;
}) {
  try {
    const tournamentDocRef = doc(db, "tournaments", tournamentId);
    const tournamentDocSnap = await getDoc(tournamentDocRef);
    const tournament = tournamentDocSnap.data();
    const match =
      tournament &&
      Array.isArray(tournament.matches) &&
      tournament.matches.find((m) => m.id === matchId);

    if (match) {
      return { success: true, data: match };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    getErrorMessage(error);
  }
}
