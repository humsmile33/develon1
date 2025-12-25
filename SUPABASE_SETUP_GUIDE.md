# Supabase 데이터베이스 설정 가이드

## 방법 1: Supabase Dashboard SQL Editor 사용 (가장 간단)

### 1. Supabase Dashboard 접속
- URL: https://wfzgznipfvkcgqnfwvuk.supabase.co
- 로그인 후 프로젝트 대시보드로 이동

### 2. SQL Editor 열기
- 왼쪽 메뉴에서 **SQL Editor** 클릭
- **New query** 버튼 클릭

### 3. SQL 파일 실행
- `supabase_schema.sql` 파일 내용 복사
- SQL Editor에 붙여넣기
- **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 4. 결과 확인
- 하단에 테이블이 생성된 것을 확인할 수 있습니다

---

## 방법 2: Supabase CLI 사용

### 1. Supabase CLI 설치
```bash
npm install -g supabase
```

### 2. Supabase에 로그인
```bash
supabase login
```

### 3. 프로젝트 링크 생성
```bash
supabase link --project-ref wfzgznipfvkcgqnfwvuk
```

### 4. SQL 실행
```bash
supabase db push --db-url "postgresql://postgres.[YOUR-PASSWORD]@db.wfzgznipfvkcgqnfwvuk.supabase.co:5432/postgres"
```

---

## 방법 3: psql 클라이언트 사용

### 1. psql 설치
- Windows: PostgreSQL 설치 시 포함
- 또는 https://www.postgresql.org/download/windows/

### 2. 연결 정보 확인
Supabase Dashboard → Settings → Database → Connection info에서 확인:
```
Host: db.wfzgznipfvkcgqnfwvuk.supabase.co
Port: 5432
User: postgres
Password: [데이터베이스 비밀번호]
Database: postgres
```

### 3. SQL 실행
```bash
psql -h db.wfzgznipfvkcgqnfwvuk.supabase.co -U postgres -d postgres -f supabase_schema.sql
```

---

## 방법 4: Supabase JS 클라이언트 사용 (애플리케이션에서 직접 실행)

Node.js 또는 브라우저에서 Supabase 클라이언트를 사용하여 SQL을 실행할 수 있습니다.

```javascript
// Node.js 예시
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wfzgznipfvkcgqnfwvuk.supabase.co',
  'YOUR_SERVICE_ROLE_KEY'  // Dashboard의 Project Settings > API에서 확인
);

// SQL 파일 읽기
const fs = require('fs');
const sql = fs.readFileSync('supabase_schema.sql', 'utf8');

// SQL 실행 (직접 SQL 실행은 Dashboard에서 권장)
```

---

## 권장 사항

**방법 1 (Dashboard SQL Editor)**을 사용하는 것을 가장 권장합니다:
- 별도 설치 불필요
- GUI로 쉽게 사용 가능
- 에러 메시지를 직관적으로 확인 가능

---

## 테이블 구조

실행 후 다음 테이블이 생성됩니다:

| 테이블 | 설명 |
|-------|------|
| `users` | 사용자 정보 |
| `categories` | 게시판 카테고리 |
| `posts` | 게시글 |
| `comments` | 댓글 |
| `attachments` | 첨부파일 |
| `post_categories` | 게시글-카테고리 조인 |

## 초기 데이터

- 4개의 카테고리 (공지사항, 자유게시판, Q&A, 정보공유)
- 1개의 관리자 계정 (username: admin, password: admin123)
- 6개의 샘플 게시글
- 3개의 샘플 댓글
