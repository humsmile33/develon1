// ============================================
// Supabase 설정
// ============================================

const SUPABASE_CONFIG = {
    url: 'https://wfzgznipfvkcgqnfwvuk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmemd6bmlwZnZrY2dxbmZ3dnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjI4MzcsImV4cCI6MjA4MjE5ODgzN30.Vzy5mJLVBFnwYt1e0UXhdN3WZDK7nqsgNwcFuIs0mTE'
};

// Supabase 클라이언트 초기화
const excavatorSupabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// 애플리케이션 설정
const APP_CONFIG = {
    maxComparisonItems: 4,
    maxWeight: 11000, // 11톤 (kg)
    weightClasses: {
        mini: { min: 0, max: 2000, label: '미니 (0-2톤)' },
        small: { min: 2001, max: 6000, label: '소형 (2-6톤)' },
        compact: { min: 6001, max: 11000, label: '중소형 (6-11톤)' }
    }
};
