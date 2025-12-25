// Supabase 설정
const SUPABASE_URL = 'https://wfzgznipfvkcgqnfwvuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmemd6bmlwZnZrY2dxbmZ3dnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjI4MzcsImV4cCI6MjA4MjE5ODgzN30.Vzy5mJLVBFnwYt1e0UXhdN3WZDK7nqsgNwcFuIs0mTE';

// Supabase 클라이언트 생성
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역 노출 (다른 모듈에서 사용)
window.SUPABASE_CLIENT = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
