// supabase.js
// Connects StealthKey to Supabase

const SUPABASE_URL = 'https://vyxyffqvegqgzcwmukag.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QBPepStpweGVTTHuUU086A_lsq0yDnZ';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);