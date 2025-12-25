# Supabase 연동 설정 가이드

이 가이드는 Modern Space 게시판을 Supabase 데이터베이스와 연동하는 방법을 안내합니다.

---

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 회원가입/로그인 합니다.
2. **"New Project"** 버튼을 클릭합니다.
3. 프로젝트 이름을 입력합니다 (예: `modern-space-board`).
4. 데이터베이스 비밀번호를 설정하고 **"Create new project"**를 클릭합니다.
5. 프로젝트가 생성될 때까지 잠시 기다립니다 (약 2분 소요).

---

## 2. 프로젝트 URL 및 API Key 확인

1. 생성된 프로젝트의 **Settings** > **API** 메뉴로 이동합니다.
2. 다음 정보를 복사해 둡니다:
   - **Project URL** (예: `https://xxxxxxxx.supabase.co`)
   - **anon public key** (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## 3. 데이터베이스 스키마 생성

1. 프로젝트의 **SQL Editor** 메뉴로 이동합니다.
2. **"New query"**를 클릭합니다.
3. `supabase_schema.sql` 파일의 전체 내용을 복사하여 SQL Editor에 붙여넣습니다.
4. **"Run"** 버튼을 클릭하여 스키마를 생성합니다.
5. 성공 메시지를 확인합니다.

---

## 4. HTML 파일 설정

### index.html 수정

```javascript
// Supabase 설정 부분을 찾아서 실제 값으로 수정합니다:
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // → 실제 Project URL로 교체
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // → 실제 anon public key로 교체
```

**예시:**
```javascript
const SUPABASE_URL = 'https://abcd1234.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2QxMjM0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU1NTU1NX0.example';
```

### post.html 수정

동일한 방식으로 `post.html` 파일의 Supabase 설정 부분도 수정합니다.

---

## 5. 로컬 웹 서버 실행

브라우저에서 파일을 직접 열면 Supabase 연동이 작동하지 않을 수 있습니다. 로컬 웹 서버를 사용하세요.

### Python 사용 (Python 3이 설치된 경우)
```bash
# 터미널에서 다음 명령어 실행:
python -m http.server 8000
```

### Node.js 사용 (http-server 패키지)
```bash
# 먼저 http-server 설치:
npm install -g http-server

# 실행:
http-server -p 8000
```

### Live Server (VS Code 확장 프로그램)
1. VS Code 확장에서 **"Live Server"**를 설치합니다.
2. `index.html` 파일에서 마우스 오른쪽 버튼을 클릭합니다.
3. **"Open with Live Server"**를 선택합니다.

---

## 6. 기능 테스트

### 6.1 게시글 목록 확인
1. 브라우저에서 `http://localhost:8000/index.html` 접속
2. 데이터베이스에 저장된 게시글 목록이 표시되는지 확인

### 6.2 게시글 작성 테스트
1. **"글쓰기"** 버튼 클릭
2. 제목, 작성자, 내용을 입력하고 **"등록하기"** 클릭
3. 게시글이 목록에 추가되는지 확인

### 6.3 게시글 상세 확인
1. 게시글 제목 클릭하여 상세 페이지 이동
2. 게시글 내용과 조회수가 정상적으로 표시되는지 확인

### 6.4 댓글 작성 테스트
1. 게시글 하단 댓글 작성 폼에 작성자명과 내용 입력
2. **"댓글 등록"** 버튼 클릭
3. 댓글이 목록에 추가되는지 확인

### 6.5 검색 기능 테스트
1. 검색창에 제목 또는 작성자명 입력
2. **"검색"** 버튼 클릭
3. 검색 결과가 올바르게 표시되는지 확인

---

## 7. 문제 해결

### "게시글 로드 실패" 메시지가 표시될 때
1. 브라우저 개발자 도구(F12) → Console 탭을 확인
2. Supabase URL과 API Key가 올바르게 설정되었는지 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

### "increment_views 함수가 존재하지 않습니다" 오류
1. SQL Editor에서 다음 쿼리를 실행하세요:
```sql
CREATE OR REPLACE FUNCTION increment_views(post_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET views = views + 1 
    WHERE id = post_id AND is_deleted = false;
END;
$$ LANGUAGE plpgsql;
```

### 게시글이 표시되지 않을 때
1. SQL Editor에서 게시글 데이터를 확인:
```sql
SELECT * FROM posts WHERE is_deleted = false;
```
2. 데이터가 없다면 `supabase_schema.sql`의 초기 데이터 INSERT 문을 다시 실행

### RLS(Row Level Security) 관련 오류
1. SQL Editor에서 다음 명령어로 RLS 확인:
```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```
2. `supabase_schema.sql`의 RLS 정책 설정 부분을 다시 실행

---

## 8. 추가 설정 (선택 사항)

### 게시글 수정/삭제 기능 추가
현재 수정/삭제 버튼은 UI만 존재합니다. 필요한 경우 추가로 구현이 필요합니다.

### 파일 첨부 기능
`attachments` 테이블이 스키마에 포함되어 있습니다. 파일 업로드 기능을 추가하려면 Supabase Storage를 설정해야 합니다.

### 사용자 인증 추가
현재는 작성자명을 직접 입력하는 방식입니다. Supabase Auth를 활용하여 로그인/회원가입 기능을 추가할 수 있습니다.

---

## 9. Supabase 대시보드에서 데이터 관리

게시글, 댓글 등의 데이터는 Supabase 대시보드에서 직접 관리할 수 있습니다:

1. **Table Editor** → `posts`, `comments` 등의 테이블 선택
2. 데이터 추가, 수정, 삭제 가능
3. SQL Editor에서 직접 쿼리 실행 가능

---

## 10. 보안 주의사항

⚠️ **중요:** `anon public key`는 클라이언트에서 사용되는 키입니다. 
프로덕션 배포 시 다음 보안 조치를 고려하세요:
- RLS(Row Level Security) 정책을 적절히 설정
- `service_role key`는 절대 클라이언트 코드에 노출하지 않기
- 민감한 데이터는 별도의 백엔드 서버에서 처리

---

## 연락처

문제가 발생하면:
- Supabase 공식 문서: https://supabase.com/docs
- Supabase 커뮤니티: https://supabase.com/community

---

**빠른 설정 체크리스트:**
- [ ] Supabase 프로젝트 생성 완료
- [ ] Project URL 및 anon key 확인
- [ ] SQL 스크립트 실행 완료
- [ ] index.html에 URL/Key 설정 완료
- [ ] post.html에 URL/Key 설정 완료
- [ ] 로컬 웹 서버 실행
- [ ] 게시글 목록 확인
- [ ] 게시글 작성 테스트
- [ ] 게시글 상세 확인
- [ ] 댓글 작성 테스트
- [ ] 검색 기능 테스트
