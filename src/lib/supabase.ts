import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwowsvdeenrgvkxuracl.supabase.co';
const supabaseAnonKey = 'sb_publishable_Eyq1J2aIU8kPG4FZ_UDewA__dxTAxN0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
