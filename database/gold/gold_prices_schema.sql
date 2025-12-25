-- ============================================
-- 금시세 크롤링 데이터베이스 스키마
-- PostgreSQL / Supabase 용 SQL 생성문
-- ============================================

-- ============================================
-- 금시세 테이블 (gold_prices)
-- ============================================
CREATE TABLE IF NOT EXISTS gold_prices (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    buy_pure_375g NUMERIC(15, 2),      -- 내가 살때 순금 3.75g
    sell_pure_375g NUMERIC(15, 2),     -- 내가 팔때 순금 3.75g
    sell_18k_375g NUMERIC(15, 2),      -- 내가 팔때 18K 3.75g
    sell_14k_375g NUMERIC(15, 2),      -- 내가 팔때 14K 3.75g
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gold_prices_date ON gold_prices(date DESC);

-- ============================================
-- Row Level Security (RLS) 정책 설정
-- ============================================

-- 기존 RLS 비활성화 및 정책 삭제
ALTER TABLE gold_prices DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gold_prices_read_all" ON gold_prices;
DROP POLICY IF EXISTS "gold_prices_insert_all" ON gold_prices;
DROP POLICY IF EXISTS "gold_prices_update_all" ON gold_prices;
DROP POLICY IF EXISTS "gold_prices_delete_all" ON gold_prices;

-- RLS 활성화
ALTER TABLE gold_prices ENABLE ROW LEVEL SECURITY;

-- gold_prices 테이블 정책
CREATE POLICY "gold_prices_read_all" ON gold_prices FOR SELECT USING (true);
CREATE POLICY "gold_prices_insert_all" ON gold_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "gold_prices_update_all" ON gold_prices FOR UPDATE USING (true);
CREATE POLICY "gold_prices_delete_all" ON gold_prices FOR DELETE USING (true);

-- ============================================
-- 샘플 데이터 삽입 (선택사항)
-- ============================================
-- INSERT INTO gold_prices (date, buy_pure_375g, sell_pure_375g, sell_18k_375g, sell_14k_375g) VALUES
-- ('2025-12-25', 400000, 380000, 270000, 210000),
-- ('2025-12-24', 398000, 378000, 268000, 208000);
