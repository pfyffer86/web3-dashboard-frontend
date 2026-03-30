import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  "https://idltdrtcvkjgotiggbss.supabase.co",
  "DEIN_ANON_KEY"
)
