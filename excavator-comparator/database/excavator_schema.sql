-- ============================================
-- 글로벌 소형 굴착기 제원 비교 플랫폼 데이터베이스 스키마
-- ============================================

-- 제조사 테이블
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_ko TEXT,
    home_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 단위 정의 테이블
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- MASS, LENGTH, POWER, VOLUME
    base_unit_id UUID REFERENCES units(id),
    conversion_factor FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 굴착기 모델 테이블
CREATE TABLE IF NOT EXISTS excavators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    model_name TEXT NOT NULL,
    operating_weight_kg FLOAT NOT NULL,
    engine_power_kw FLOAT,
    digging_depth_mm FLOAT,
    bucket_capacity_m3 FLOAT,
    overall_width_mm FLOAT,
    overall_height_mm FLOAT,
    tail_swing_radius_mm FLOAT,
    fuel_tank_capacity_l FLOAT,
    hydraulic_tank_capacity_l FLOAT,
    image_url TEXT,
    source_url TEXT,
    weight_class TEXT, -- 'mini' (0-2t), 'small' (2-6t), 'compact' (6-11t)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 상세 제원 테이블 (EAV 패턴)
CREATE TABLE IF NOT EXISTS specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    excavator_id UUID NOT NULL REFERENCES excavators(id) ON DELETE CASCADE,
    spec_category TEXT NOT NULL, -- Engine, Hydraulics, Dimensions, Performance, etc.
    spec_name TEXT NOT NULL,
    value_numeric FLOAT,
    unit_id UUID REFERENCES units(id),
    value_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_excavators_manufacturer ON excavators(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_excavators_weight ON excavators(operating_weight_kg);
CREATE INDEX IF NOT EXISTS idx_excavators_weight_class ON excavators(weight_class);
CREATE INDEX IF NOT EXISTS idx_specifications_excavator ON specifications(excavator_id);
CREATE INDEX IF NOT EXISTS idx_specifications_category ON specifications(spec_category);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- manufacturers 테이블 트리거
CREATE TRIGGER update_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- excavators 테이블 트리거
CREATE TRIGGER update_excavators_updated_at
    BEFORE UPDATE ON excavators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 초기 데이터 (Seed Data)
-- ============================================

-- 제조사 데이터
INSERT INTO manufacturers (name, name_ko, home_url) VALUES
    ('Develon', '두산인프라코어', 'https://na.develon-ce.com'),
    ('Hyundai', '현대건설기계', 'https://hcce.com'),
    ('Kubota', '쿠보타', 'https://kubota.com'),
    ('Takeuchi', '다케우치', 'https://takeuchi.com'),
    ('Bobcat', '밥캣', 'https://bobcat.com'),
    ('Hitachi', '히타치', 'https://hitachicm.com'),
    ('Yanmar', '얀마', 'https://yanmar.com'),
    ('Caterpillar', '캐터필러', 'https://cat.com'),
    ('Kobelco', '코벨코', 'https://kobelco.com')
ON CONFLICT (name) DO NOTHING;

-- 단위 데이터
INSERT INTO units (symbol, name, type, base_unit_id, conversion_factor) VALUES
    -- 질량 단위 (kg를 기준으로)
    ('kg', '킬로그램', 'MASS', NULL, 1.0),
    ('lbs', '파운드', 'MASS', NULL, 0.453592),
    ('ton', '톤', 'MASS', NULL, 1000.0),
    
    -- 길이 단위 (mm를 기준으로)
    ('mm', '밀리미터', 'LENGTH', NULL, 1.0),
    ('cm', '센티미터', 'LENGTH', NULL, 10.0),
    ('m', '미터', 'LENGTH', NULL, 1000.0),
    ('inch', '인치', 'LENGTH', NULL, 25.4),
    ('ft', '피트', 'LENGTH', NULL, 304.8),
    
    -- 동력 단위 (kW를 기준으로)
    ('kW', '킬로와트', 'POWER', NULL, 1.0),
    ('hp', '마력', 'POWER', NULL, 0.7457),
    ('ps', '마력(독일)', 'POWER', NULL, 0.7355),
    
    -- 부피 단위 (liter를 기준으로)
    ('L', '리터', 'VOLUME', NULL, 1.0),
    ('m³', '입방미터', 'VOLUME', NULL, 1000.0),
    ('gal', '갤런', 'VOLUME', NULL, 3.78541)
ON CONFLICT (symbol) DO NOTHING;

-- ============================================
-- 시뮬레이션을 위한 샘플 굴착기 데이터 (45개 모델 이상)
-- ============================================

-- 샘플 굴착기 모델 데이터
INSERT INTO excavators (
    manufacturer_id, model_name, operating_weight_kg, engine_power_kw, 
    digging_depth_mm, bucket_capacity_m3, overall_width_mm, 
    tail_swing_radius_mm, fuel_tank_capacity_l, weight_class, source_url
) 
SELECT 
    m.id,
    model.model_name,
    model.operating_weight_kg,
    model.engine_power_kw,
    model.digging_depth_mm,
    model.bucket_capacity_m3,
    model.overall_width_mm,
    model.tail_swing_radius_mm,
    model.fuel_tank_capacity_l,
    model.weight_class,
    model.source_url
FROM (
    VALUES
        -- Develon 모델
        ('Develon', 'DX17Z-7', 1850, 11.9, 2300, 0.045, 990, 580, 18, 'mini', 'https://na.develon-ce.com'),
        ('Develon', 'DX35Z-7', 3550, 21.8, 3000, 0.09, 1550, 830, 32, 'small', 'https://na.develon-ce.com'),
        ('Develon', 'DX55R-7', 5400, 36.4, 3500, 0.14, 1950, 1000, 45, 'small', 'https://na.develon-ce.com'),
        ('Develon', 'DX80R-7', 8200, 51.5, 4200, 0.24, 2300, 1200, 65, 'compact', 'https://na.develon-ce.com'),
        ('Develon', 'DX100R-7', 10200, 63.2, 4800, 0.30, 2550, 1350, 80, 'compact', 'https://na.develon-ce.com'),
        
        -- Hyundai 모델
        ('Hyundai', 'R17Z-9A', 1750, 12.1, 2400, 0.045, 980, 600, 18, 'mini', 'https://hcce.com'),
        ('Hyundai', 'R35Z-9A', 3600, 22.5, 3100, 0.09, 1560, 850, 33, 'small', 'https://hcce.com'),
        ('Hyundai', 'R55CR-9A', 5600, 37.8, 3600, 0.14, 1980, 1020, 47, 'small', 'https://hcce.com'),
        ('Hyundai', 'R80CR-9A', 8300, 52.8, 4300, 0.25, 2320, 1250, 68, 'compact', 'https://hcce.com'),
        ('Hyundai', 'R110-7A', 10800, 66.5, 5000, 0.32, 2600, 1450, 85, 'compact', 'https://hcce.com'),
        
        -- Kubota 모델
        ('Kubota', 'U17-3α', 1840, 12.2, 2350, 0.045, 995, 620, 18, 'mini', 'https://kubota.com'),
        ('Kubota', 'U35-6', 3550, 22.7, 3200, 0.09, 1540, 845, 33, 'small', 'https://kubota.com'),
        ('Kubota', 'U55-6', 5600, 38.5, 3650, 0.14, 1990, 1040, 48, 'small', 'https://kubota.com'),
        ('Kubota', 'U08-5', 835, 5.2, 1800, 0.025, 690, 450, 12, 'mini', 'https://kubota.com'),
        ('Kubota', 'KX080-4α', 8450, 53.0, 4400, 0.26, 2350, 1280, 70, 'compact', 'https://kubota.com'),
        
        -- Takeuchi 모델
        ('Takeuchi', 'TB016', 1680, 11.8, 2250, 0.04, 980, 590, 17, 'mini', 'https://takeuchi.com'),
        ('Takeuchi', 'TB230', 2825, 18.2, 2900, 0.08, 1550, 810, 28, 'small', 'https://takeuchi.com'),
        ('Takeuchi', 'TB250', 4980, 34.5, 3400, 0.13, 1900, 980, 42, 'small', 'https://takeuchi.com'),
        ('Takeuchi', 'TB290', 5900, 42.7, 3800, 0.16, 2050, 1100, 52, 'small', 'https://takeuchi.com'),
        ('Takeuchi', 'TB2150', 10500, 66.8, 5100, 0.33, 2650, 1500, 88, 'compact', 'https://takeuchi.com'),
        
        -- Bobcat 모델
        ('Bobcat', 'E17z', 1820, 11.9, 2280, 0.04, 980, 595, 17, 'mini', 'https://bobcat.com'),
        ('Bobcat', 'E35', 3620, 21.9, 3050, 0.09, 1540, 835, 32, 'small', 'https://bobcat.com'),
        ('Bobcat', 'E55', 5600, 38.0, 3580, 0.14, 1970, 1020, 46, 'small', 'https://bobcat.com'),
        ('Bobcat', 'E85', 8450, 53.5, 4250, 0.25, 2320, 1240, 68, 'compact', 'https://bobcat.com'),
        ('Bobcat', 'E110', 10800, 65.0, 4950, 0.31, 2580, 1420, 84, 'compact', 'https://bobcat.com'),
        
        -- Hitachi 모델
        ('Hitachi', 'ZX17U-6', 1850, 12.0, 2320, 0.045, 990, 600, 18, 'mini', 'https://hitachicm.com'),
        ('Hitachi', 'ZX35U-6', 3580, 22.0, 3080, 0.09, 1565, 840, 33, 'small', 'https://hitachicm.com'),
        ('Hitachi', 'ZX55U-6', 5650, 38.2, 3620, 0.14, 1995, 1030, 47, 'small', 'https://hitachicm.com'),
        ('Hitachi', 'ZX80U-6', 8350, 53.2, 4280, 0.25, 2330, 1260, 68, 'compact', 'https://hitachicm.com'),
        ('Hitachi', 'ZX110-6', 10750, 66.0, 4980, 0.31, 2590, 1440, 85, 'compact', 'https://hitachicm.com'),
        
        -- Yanmar 모델
        ('Yanmar', 'ViO17-6A', 1860, 12.3, 2340, 0.045, 995, 610, 18, 'mini', 'https://yanmar.com'),
        ('Yanmar', 'ViO35-6A', 3570, 22.5, 3150, 0.09, 1555, 850, 33, 'small', 'https://yanmar.com'),
        ('Yanmar', 'ViO55-6A', 5620, 38.8, 3680, 0.14, 2000, 1045, 48, 'small', 'https://yanmar.com'),
        ('Yanmar', 'B08-6', 840, 5.3, 1820, 0.025, 695, 455, 12, 'mini', 'https://yanmar.com'),
        ('Yanmar', 'SV100', 10600, 67.5, 5020, 0.32, 2620, 1460, 86, 'compact', 'https://yanmar.com'),
        
        -- Caterpillar 모델
        ('Caterpillar', '301.7', 1840, 12.1, 2300, 0.04, 980, 598, 18, 'mini', 'https://cat.com'),
        ('Caterpillar', '305', 3580, 22.0, 3050, 0.09, 1540, 840, 32, 'small', 'https://cat.com'),
        ('Caterpillar', '315', 16300, 86.0, 5600, 0.41, 2490, 1800, 130, 'compact', 'https://cat.com'),
        ('Caterpillar', '301.5', 1720, 11.5, 2200, 0.04, 960, 580, 17, 'mini', 'https://cat.com'),
        ('Caterpillar', '308', 8000, 51.0, 4200, 0.24, 2300, 1200, 65, 'compact', 'https://cat.com'),
        
        -- Kobelco 모델
        ('Kobelco', 'SK17SR-6', 1870, 12.2, 2360, 0.045, 1000, 605, 18, 'mini', 'https://kobelco.com'),
        ('Kobelco', 'SK35SR-6', 3600, 22.2, 3100, 0.09, 1570, 848, 33, 'small', 'https://kobelco.com'),
        ('Kobelco', 'SK55SR-6', 5670, 38.5, 3650, 0.14, 2010, 1045, 48, 'small', 'https://kobelco.com'),
        ('Kobelco', 'SK80SR-6', 8400, 53.5, 4300, 0.25, 2340, 1270, 69, 'compact', 'https://kobelco.com'),
        ('Kobelco', 'SK100-8', 10900, 67.2, 5000, 0.32, 2610, 1470, 87, 'compact', 'https://kobelco.com')
) AS model(manufacturer_name, model_name, operating_weight_kg, engine_power_kw, digging_depth_mm, bucket_capacity_m3, overall_width_mm, tail_swing_radius_mm, fuel_tank_capacity_l, weight_class, source_url)
JOIN manufacturers m ON m.name = model.manufacturer_name
ON CONFLICT DO NOTHING;
