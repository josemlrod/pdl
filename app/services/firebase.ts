import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
  transactions: [];
  isHidden?: boolean;
};

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
