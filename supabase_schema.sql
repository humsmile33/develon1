-- ============================================
-- Modern Space 게시판 데이터베이스 스키마
-- PostgreSQL / Supabase 용 SQL 생성문
-- ============================================

-- ============================================
-- 1. 사용자 테이블 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. 카테고리 테이블 (categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. 게시글 테이블 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(50) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    notice_type VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (notice_type IN ('none', 'notice', 'info')),
    views INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_notice_type ON posts(notice_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON posts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);

-- ============================================
-- 4. 댓글 테이블 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author VARCHAR(50) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author);

-- ============================================
-- 5. 첨부파일 테이블 (attachments)
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_attachments_post_id ON attachments(post_id);

-- ============================================
-- 6. 게시글-카테고리 조인 테이블 (게시글은 여러 카테고리에 속할 수 있음)
-- ============================================
CREATE TABLE IF NOT EXISTS post_categories (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- ============================================
-- 초기 데이터 삽입 (INSERT)
-- ============================================

-- 기본 카테고리 데이터
INSERT INTO categories (name, description, display_order) VALUES
('공지사항', '중요 공지사항 게시판', 1),
('자유게시판', '자유로운 주제 게시판', 2),
('Q&A', '질문과 답변 게시판', 3),
('정보공유', '유용한 정보 공유 게시판', 4)
ON CONFLICT (name) DO NOTHING;

-- 관리자 계정 생성 (비밀번호: admin123)
-- 실제 사용 시에는 bcrypt로 해시된 비밀번호를 사용해야 함
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@modernspace.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 샘플 게시글 데이터
INSERT INTO posts (title, content, author, user_id, notice_type, views, created_at) VALUES
('환영합니다! 게시판 사용을 위한 공지사항입니다.', 
 '안녕하세요! Modern Space 게시판에 오신 것을 환영합니다.

이 게시판은 자유롭게 소통하고 정보를 공유할 수 있는 공간입니다.

게시판 이용 시 아래 규칙을 준수해 주세요:
1. 타인을 존중하는 예절을 지켜주세요.
2. 스팸 및 광고 게시물은 금지됩니다.
3. 타인의 개인정보를 게시하지 마세요.', 
 '운영자', 1, 'notice', 1203, '2024-05-20 09:00:00'),

('프로젝트 시작 전에 기획서 어떻게 작성하시나요?', 
 '안녕하세요! 웹 개발을 시작한 지 얼마 안 된 초보 개발자입니다.

현재 새로운 프로젝트를 시작하려고 하는데, 기획서를 어떻게 작성해야 할지 고민이 많습니다.

경험 있는 분들이나 회사에서는 보통 어떤 항목을 포함해서 기획서를 작성하시나요?

특히 다음과 같은 항목이 궁금합니다:
- 프로젝트 목표 및 범위
- 기능 요구사항 목록
- 기술 스택 선정 이유
- 개발 일정 및 마일스톤
- 예상되는 문제점과 해결 방안

조언해 주시면 정말 감사하겠습니다!', 
 '김철수', NULL, 'none', 45, '2024-05-19 14:00:00'),

('최신 웹 디자인 트렌드 공유합니다.', 
 '최근 웹 디자인 트렌드에 대해 정리해 보았습니다.

1. 다크 모드 디자인
2. 그라데이션 활용
3. 미니멀리즘
4. 마이크로 인터랙션
5. 3D 요소 활용

이러한 트렌드들을 잘 활용하면 더 매력적인 웹사이트를 만들 수 있습니다.

참고가 되셨길 바랍니다!', 
 '이디자인', NULL, 'none', 128, '2024-05-18 16:30:00'),

('HTML/CSS 질문 있는데요, 도와주실 분?', 
 'CSS Flexbox와 Grid 차이점이 정확히 뭔가요?

언제 Flexbox를 쓰고, 언제 Grid를 써야 할지 헷갈립니다.

간단한 예시와 함께 설명해 주시면 정말 감사하겠습니다.', 
 '초보코더', NULL, 'none', 12, '2024-05-18 11:20:00'),

('오늘 점심 맛집 추천 부탁드려요~', 
 '사무실 근처 점심 맛집 찾고 있어요.

한식, 중식, 일식 상관없습니다.
가격은 1만원 전후로 좋아요.

맛있는 곳 알려주세요!', 
 '박배고픔', NULL, 'none', 34, '2024-05-17 12:30:00'),

('서버 점검 안내 (5/25)', 
 '안녕하세요!

2024년 5월 25일 서버 점검을 진행할 예정입니다.

- 점검 시간: 2024년 5월 25일 오전 2시 ~ 오전 6시
- 점검 내용: 시스템 안정화 및 기능 개선

점검 기간 동안 서비스 이용이 불가능하니 양해 부탁드립니다.

감사합니다.', 
 '운영팀', 1, 'info', 560, '2024-05-16 10:00:00');

-- 샘플 댓글 데이터
INSERT INTO comments (post_id, author, user_id, content, created_at) VALUES
(2, '이시니어', NULL, '안녕하세요! 기획서 작성에 대한 경험을 공유해 드릴게요. 먼저 사용자 스토리(User Story)를 작성하는 것부터 시작하는 것을 추천합니다. "사용자로서, ~하고 싶다. 그래서 ~을 한다." 형식으로 작성하면 좋습니다.', '2024-05-19 14:32:00'),
(2, '개발자A', NULL, '저는 항상 와이어프레임을 먼저 그리고 기획서를 작성합니다. 시각적인 요소를 먼저 정리하고 나면 기능 명세가 훨씬 수월해져요. Figma나 Sketch 같은 툴을 추천합니다!', '2024-05-19 15:45:00'),
(2, '코딩고수', NULL, '팀 프로젝트라면 Notion이나 Confluence 같은 협업 툴을 사용하는 것도 좋아요. 실시간으로 협업할 수 있어서 효율적입니다.', '2024-05-19 18:20:00');

-- ============================================
-- Row Level Security (RLS) 정책 설정
-- ============================================

-- 기존 RLS 비활성화 및 정책 삭제 (users 테이블)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_all" ON users;
DROP POLICY IF EXISTS "users_insert_all" ON users;
DROP POLICY IF EXISTS "users_update_all" ON users;
DROP POLICY IF EXISTS "users_delete_all" ON users;

-- 기존 RLS 비활성화 및 정책 삭제 (posts 테이블)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_read_all" ON posts;
DROP POLICY IF EXISTS "posts_insert_all" ON posts;
DROP POLICY IF EXISTS "posts_update_all" ON posts;
DROP POLICY IF EXISTS "posts_delete_all" ON posts;

-- 기존 RLS 비활성화 및 정책 삭제 (comments 테이블)
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_read_all" ON comments;
DROP POLICY IF EXISTS "comments_insert_all" ON comments;
DROP POLICY IF EXISTS "comments_update_all" ON comments;
DROP POLICY IF EXISTS "comments_delete_all" ON comments;

-- 기존 RLS 비활성화 및 정책 삭제 (attachments 테이블)
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attachments_read_all" ON attachments;
DROP POLICY IF EXISTS "attachments_insert_all" ON attachments;
DROP POLICY IF EXISTS "attachments_delete_all" ON attachments;

-- 기존 RLS 비활성화 및 정책 삭제 (post_categories 테이블)
ALTER TABLE post_categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_categories_read_all" ON post_categories;
DROP POLICY IF EXISTS "post_categories_insert_all" ON post_categories;
DROP POLICY IF EXISTS "post_categories_delete_all" ON post_categories;

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

-- users 테이블 정책
CREATE POLICY "users_read_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_all" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_all" ON users FOR DELETE USING (true);

-- posts 테이블 정책
CREATE POLICY "posts_read_all" ON posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "posts_insert_all" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update_all" ON posts FOR UPDATE USING (true);
CREATE POLICY "posts_delete_all" ON posts FOR DELETE USING (true);

-- comments 테이블 정책
CREATE POLICY "comments_read_all" ON comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "comments_insert_all" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update_all" ON comments FOR UPDATE USING (true);
CREATE POLICY "comments_delete_all" ON comments FOR DELETE USING (true);

-- attachments 테이블 정책
CREATE POLICY "attachments_read_all" ON attachments FOR SELECT USING (true);
CREATE POLICY "attachments_insert_all" ON attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "attachments_delete_all" ON attachments FOR DELETE USING (true);

-- post_categories 테이블 정책
CREATE POLICY "post_categories_read_all" ON post_categories FOR SELECT USING (true);
CREATE POLICY "post_categories_insert_all" ON post_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "post_categories_delete_all" ON post_categories FOR DELETE USING (true);

-- ============================================
-- 조회수 증가 함수 (RPC)
-- ============================================
CREATE OR REPLACE FUNCTION increment_views(post_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE posts 
    SET views = views + 1 
    WHERE id = post_id AND is_deleted = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 유용한 뷰 (Views) 생성
-- ============================================

-- 게시글 목록 뷰 (카테고리, 댓글 수 포함)
CREATE OR REPLACE VIEW v_post_list AS
SELECT 
    p.id,
    p.title,
    p.author,
    TO_CHAR(p.created_at, 'YYYY-MM-DD') AS created_date,
    p.views,
    p.notice_type,
    p.is_deleted,
    c.name AS category_name,
    COUNT(DISTINCT cm.id) AS comment_count
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN comments cm ON cm.post_id = p.id AND cm.is_deleted = false
WHERE p.is_deleted = false
GROUP BY p.id, c.name
ORDER BY 
    CASE WHEN p.notice_type != 'none' THEN 0 ELSE 1 END,
    p.created_at DESC;

-- ============================================
-- 자주 사용하는 쿼리 예시
-- ============================================

-- 게시글 목록 조회 (최신순, 공지사항 우선)
/*
SELECT 
    id, 
    title, 
    author, 
    TO_CHAR(created_at, 'YYYY-MM-DD') AS created_date,
    views,
    notice_type
FROM posts
WHERE is_deleted = false
ORDER BY 
    CASE WHEN notice_type != 'none' THEN 0 ELSE 1 END,
    created_at DESC
LIMIT 10;
*/

-- 게시글 상세 조회
/*
SELECT 
    p.*,
    c.name AS category_name,
    TO_CHAR(p.created_at, 'YYYY-MM-DD HH24:MI') AS formatted_date
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.id = $1;
*/

-- 댓글 목록 조회
/*
SELECT 
    id,
    author,
    content,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_date
FROM comments
WHERE post_id = $1 AND is_deleted = false
ORDER BY created_at ASC;
*/

-- 검색 (제목 또는 작성자)
/*
SELECT 
    id, 
    title, 
    author, 
    TO_CHAR(created_at, 'YYYY-MM-DD') AS created_date,
    views,
    notice_type
FROM posts
WHERE is_deleted = false
  AND (title LIKE $1 OR author LIKE $1)
ORDER BY created_at DESC
LIMIT 10;
*/
