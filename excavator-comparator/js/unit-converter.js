// ============================================
// 단위 변환 모듈
// ============================================

const UnitConverter = {
    // 단위 변환 계수
    conversionFactors: {
        // 질량 (기준: kg)
        MASS: {
            kg: 1,
            lbs: 2.20462,
            ton: 0.001
        },
        // 길이 (기준: mm)
        LENGTH: {
            mm: 1,
            cm: 0.1,
            m: 0.001,
            inch: 0.03937,
            ft: 0.00328
        },
        // 동력 (기준: kW)
        POWER: {
            kW: 1,
            hp: 1.34102,
            ps: 1.35962
        },
        // 부피 (기준: L)
        VOLUME: {
            L: 1,
            'm³': 0.001,
            gal: 0.26417
        }
    },

    // 현재 선택된 단위 시스템
    currentSystem: 'metric', // 'metric' or 'imperial'

    // 단위 시스템 설정
    setUnitSystem(system) {
        this.currentSystem = system;
    },

    // 미터법 단위로 변환
    toMetric(value, fromUnit, type) {
        if (value === null || value === undefined) return null;
        
        const factors = this.conversionFactors[type];
        if (!factors) return value;

        // 기본 단위로 변환 (미터법 기준)
        let baseValue;
        if (fromUnit in factors) {
            // 이미 기본 단위면 그대로
            if (fromUnit === 'kg' || fromUnit === 'mm' || fromUnit === 'kW' || fromUnit === 'L') {
                baseValue = value;
            } else {
                // 기본 단위가 아니면 변환
                baseValue = value / factors[fromUnit];
            }
        } else {
            baseValue = value;
        }

        return baseValue;
    },

    // 야드파운드법 단위로 변환
    toImperial(value, type) {
        if (value === null || value === undefined) return null;
        
        const factors = this.conversionFactors[type];
        if (!factors) return value;

        // 기본 단위(미터법)에서 야드파운드법으로 변환
        switch (type) {
            case 'MASS':
                return value * factors.lbs; // kg -> lbs
            case 'LENGTH':
                return value * factors.inch; // mm -> inch
            case 'POWER':
                return value * factors.hp; // kW -> hp
            case 'VOLUME':
                return value * factors.gal; // L -> gal
            default:
                return value;
        }
    },

    // 값 포맷팅 (천 단위 콤마, 소수점)
    formatValue(value, decimals = 1) {
        if (value === null || value === undefined) return '-';
        return value.toLocaleString('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    // 제원 값과 단위로 포맷팅
    formatSpec(value, type, showConverted = true) {
        if (value === null || value === undefined) return '-';
        
        if (this.currentSystem === 'metric') {
            // 미터법: 기본 단위 표시 + 야드파운드법 병기
            const metricUnits = { MASS: 'kg', LENGTH: 'mm', POWER: 'kW', VOLUME: 'L' };
            const imperialUnits = { MASS: 'lbs', LENGTH: 'inch', POWER: 'hp', VOLUME: 'gal' };
            
            const primaryUnit = metricUnits[type];
            const secondaryUnit = imperialUnits[type];
            
            let result = `${this.formatValue(value)} ${primaryUnit}`;
            
            if (showConverted) {
                const convertedValue = this.toImperial(value, type);
                result += ` (${this.formatValue(convertedValue)} ${secondaryUnit})`;
            }
            
            return result;
        } else {
            // 야드파운드법: 야드파운드법 단위 표시 + 미터법 병기
            const metricUnits = { MASS: 'kg', LENGTH: 'mm', POWER: 'kW', VOLUME: 'L' };
            const imperialUnits = { MASS: 'lbs', LENGTH: 'inch', POWER: 'hp', VOLUME: 'gal' };
            
            const primaryUnit = imperialUnits[type];
            const secondaryUnit = metricUnits[type];
            
            const primaryValue = this.toImperial(value, type);
            let result = `${this.formatValue(primaryValue)} ${primaryUnit}`;
            
            if (showConverted) {
                result += ` (${this.formatValue(value)} ${secondaryUnit})`;
            }
            
            return result;
        }
    },

    // 특정 단위로 변환하여 포맷팅
    formatToUnit(value, targetUnit, type) {
        if (value === null || value === undefined) return '-';
        
        const factors = this.conversionFactors[type];
        if (!factors) return this.formatValue(value);

        const metricUnits = { MASS: 'kg', LENGTH: 'mm', POWER: 'kW', VOLUME: 'L' };
        const baseUnit = metricUnits[type];
        
        let convertedValue;
        if (targetUnit === baseUnit) {
            convertedValue = value;
        } else {
            convertedValue = value * factors[targetUnit];
        }

        return `${this.formatValue(convertedValue)} ${targetUnit}`;
    },

    // 중량 변환 (톤 단위로)
    formatWeight(kg) {
        if (kg === null || kg === undefined) return '-';
        const tons = kg / 1000;
        
        if (this.currentSystem === 'metric') {
            return `${this.formatValue(kg, 0)} kg (${this.formatValue(tons, 2)} t)`;
        } else {
            const lbs = this.toImperial(kg, 'MASS');
            return `${this.formatValue(lbs, 0)} lbs (${this.formatValue(tons, 2)} t)`;
        }
    },

    // 길이 변환 (미터 단위로)
    formatLength(mm) {
        if (mm === null || mm === undefined) return '-';
        const m = mm / 1000;
        
        if (this.currentSystem === 'metric') {
            return `${this.formatValue(mm, 0)} mm (${this.formatValue(m, 2)} m)`;
        } else {
            const ft = mm / 304.8;
            return `${this.formatValue(ft, 1)} ft (${this.formatValue(m, 2)} m)`;
        }
    },

    // 엔진 출력 변환
    formatPower(kW) {
        if (kW === null || kW === undefined) return '-';
        
        if (this.currentSystem === 'metric') {
            return `${this.formatValue(kW, 1)} kW (${this.formatValue(kW * 1.34102, 1)} hp)`;
        } else {
            const hp = kW * 1.34102;
            return `${this.formatValue(hp, 1)} hp (${this.formatValue(kW, 1)} kW)`;
        }
    },

    // 버킷 용량 변환
    formatBucketCapacity(m3) {
        if (m3 === null || m3 === undefined) return '-';
        
        if (this.currentSystem === 'metric') {
            return `${this.formatValue(m3, 3)} m³`;
        } else {
            const yd3 = m3 * 1.30795;
            return `${this.formatValue(yd3, 3)} yd³`;
        }
    },

    // 연료 탱크 용량 변환
    formatFuelCapacity(L) {
        if (L === null || L === undefined) return '-';
        
        if (this.currentSystem === 'metric') {
            return `${this.formatValue(L, 0)} L`;
        } else {
            const gal = L * 0.26417;
            return `${this.formatValue(gal, 1)} gal`;
        }
    }
};
