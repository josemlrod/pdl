import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "./utils";
import { AddUser } from "./firebase";

const supabaseUrl = "https://okiqqoqdblxqmojaaeto.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raXFxb3FkYmx4cW1vamFhZXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3MTYwMzcsImV4cCI6MjAyMTI5MjAzN30.qp_43X9H72r61WYR8eado01nFpwlpsr3di_bt9sGsxA";
export const supabase = createClient(supabaseUrl, supabaseKey);

type SignUpUserProps = {
  displayName: string;
  email: string;
  password: string;
};

type LogInUserProps = Omit<SignUpUserProps, "displayName">;

export async function signUpNewUser({
  displayName,
  email,
  password,
}: SignUpUserProps) {
  try {
    // TODO:
    // do something with the error here
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          displayName,
        },
      },
    });
    const userId = data && data.user ? data.user.id : "";
    await AddUser({
      email,
      displayName,
      userId,
    });

    return userId;
  } catch (e) {
    return getErrorMessage(e);
  }
}

export async function logInNewUser({ email, password }: LogInUserProps) {
  try {
    // TODO:
    // do something with the error here
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log({ data, error });
    const userId = data && data.user ? data.user.id : "";

    return userId;
  } catch (e) {
    return getErrorMessage(e);
  }
}
