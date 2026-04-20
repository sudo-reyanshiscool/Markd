import { CLOUD_CONFIG_ERROR } from "./constants";
import { createEmptyAppData, normaliseAppData } from "./appData";
import { supabase } from "./lib/supabase";

export const SCHOOL_BY_EMAIL_DOMAIN = {
  "british-school.org": "The British School New Delhi",
};

export const getSchoolFromEmail = (email) => {
  const normalisedEmail = String(email || "").trim().toLowerCase();
  const domain = normalisedEmail.includes("@") ? normalisedEmail.split("@").pop() : "";
  return SCHOOL_BY_EMAIL_DOMAIN[domain] || "";
};

export const buildSessionUser = (authUser, profile) => ({
  userId: authUser.id,
  email: (profile?.email || authUser.email || "").toLowerCase(),
  name: profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Student",
  school: profile?.school || authUser.user_metadata?.school || "",
});

export const upsertProfile = async ({ id, email, name, school, appData }) => {
  if (!supabase) throw new Error(CLOUD_CONFIG_ERROR);

  const payload = {
    id,
    email: email.toLowerCase(),
    name: name || "",
    school: school || "",
  };

  if (appData !== undefined) {
    payload.app_data = normaliseAppData(appData);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, name, school, app_data")
    .single();

  if (error) throw error;
  return data;
};

export const ensureProfile = async (authUser, fallback = {}) => {
  if (!supabase) throw new Error(CLOUD_CONFIG_ERROR);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, school, app_data")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  return upsertProfile({
    id: authUser.id,
    email: fallback.email || authUser.email || "",
    name: fallback.name || authUser.user_metadata?.name || "",
    school: fallback.school || authUser.user_metadata?.school || "",
    appData: createEmptyAppData(),
  });
};
