import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://isluhxhukcbvzvpdhupa.supabase.co";

const SUPABASE_KEY = "sb_publishable_kfjaxRWSk_RKC1naGXfn-w_nQT4ef3W";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);