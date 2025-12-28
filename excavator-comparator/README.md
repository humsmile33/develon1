# 글로벌 소형 굴착기 제원 비교 플랫폼

9개 글로벌 제조사(Develon, Hyundai, Kubota, Takeuchi, Bobcat, Hitachi, Yanmar, Cat, Kobelco)의 11톤 이하 소형 굴착기 모델 제원을 비교할 수 있는 웹 플랫폼입니다.

## 🎯 주요 기능

- **모델 탐색**: 45개 이상의 굴착기 모델 제원 확인
- **다중 필터**: 제조사, 체급, 중량 범위, 모델명 검색
- **비교 기능**: 최대 4개 모델을 선택하여 동시 비교
- **단위 변환**: 미터법/야드파운드법 자동 변환 및 병기 표시
- **PDF 내보내기**: 비교 결과를 PDF로 다운로드
- **차이점 하이라이트**: 동일한 제원은 숨기고 차이점만 표시

## 📁 프로젝트 구조

```
excavator-comparator/
├── index.html              # 메인 페이지
├── css/
│   └── styles.css         # 스타일시트
├── js/
│   ├── config.js          # Supabase 및 앱 설정
│   ├── database.js        # 데이터베이스 연동
│   ├── unit-converter.js  # 단위 변환 로직
│   └── app.js            # 메인 애플리케이션 로직
└── database/
    └── excavator_schema.sql # 데이터베이스 스키마 및 시드 데이터
```

## 🚀 설치 및 실행

### 1. 데이터베이스 설정

Supabase 콘솔에서 다음 SQL을 실행하여 테이블을 생성하고 시드 데이터를 입력하세요.

```bash
# SQL 파일의 내용을 복사하여 Supabase SQL Editor에 붙여넣기
 excavator-comparator/database/excavator_schema.sql
```

### 2. 환경 변수 확인

`js/config.js` 파일에서 Supabase 연결 정보를 확인하세요.

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key'
};
```

### 3. 로컬 서버 실행

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 또는 Live Server 확장프로그램 사용
```

브라우저에서 `http://localhost:8000/excavator-comparator/` 접속

## 📊 데이터베이스 스키마

### 주요 테이블

#### `manufacturers` - 제조사 정보
- `id`: 고유 식별자
- `name`: 제조사명
- `name_ko`: 한국어 제조사명
- `home_url`: 공식 홈페이지 URL

#### `units` - 단위 정의
- `id`: 고유 식별자
- `symbol`: 단위 기호 (kg, lbs, hp, kW 등)
- `type`: 물리량 종류 (MASS, LENGTH, POWER, VOLUME)
- `conversion_factor`: 변환 계수

#### `excavators` - 굴착기 모델
- `id`: 고유 식별자
- `manufacturer_id`: 제조사 ID
- `model_name`: 모델명
- `operating_weight_kg`: 운전 중량 (kg)
- `engine_power_kw`: 엔진 출력 (kW)
- `digging_depth_mm`: 최대 굴착 깊이 (mm)
- `bucket_capacity_m3`: 버킷 용량 (m³)
- `overall_width_mm`: 전폭 (mm)
- `tail_swing_radius_mm`: 후방 선회 반경 (mm)
- `fuel_tank_capacity_l`: 연료 탱크 용량 (L)
- `weight_class`: 체급 (mini, small, compact)

## 🎨 사용법

### 모델 검색 및 필터링

1. **제조사 필터**: 원하는 제조사 체크박스 선택
2. **체급 필터**: 미니(0-2톤), 소형(2-6톤), 중소형(6-11톤) 선택
3. **중량 범위**: 슬라이더로 최소/최대 중량 설정
4. **검색**: 모델명으로 검색
5. **필터 적용**: "필터 적용" 버튼 클릭

### 모델 비교

1. 비교할 모델 카드 클릭 또는 "비교함에 추가" 버튼 클릭
2. 최대 4개까지 모델 선택 가능
3. 화면 하단 비교함에 "비교하기" 버튼 클릭
4. 비교 테이블에서 상세 제원 확인

### 단위 변환

- **미터법**: kg, mm, kW, L 우선 표시 + 야드파운드법 병기
- **야드파운드법**: lbs, inch, hp, gal 우선 표시 + 미터법 병기

상단의 단위 토글 버튼으로 전환 가능합니다.

### PDF 다운로드

비교 모달에서 "PDF 다운로드" 버튼 클릭하여 현재 비교 결과를 저장하세요.

## 🔧 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: html2pdf.js
- **Icons**: Font Awesome

## 📝 개발 참고사항

### 단위 변환 로직

모든 데이터는 미터법(kg, mm, kW, L)을 기준으로 저장됩니다. 표시 시 사용자가 선택한 단위 시스템에 맞춰 실시간으로 변환됩니다.

### 차이점 하이라이트

"차이점만 보기" 체크박스를 활성화하면, 선택한 모델들의 값이 동일한 행은 숨겨지고 차이가 있는 제원만 표시됩니다.

### 확장 가능성

- 추가 제조사 데이터 수집 (크롤러 개발)
- 실시간 가격 정보 통합
- 사용자 리뷰 및 평점 시스템
- 3D 모델 뷰어 통합

## 📄 라이선스

© 2024 Modern Space. All rights reserved.

## 🤝 기여

이 프로젝트는 해커톤을 위해 개발되었습니다.
