-- ============================================
-- Modern Space 게시판 데이터베이스 스키마
-- MySQL / MariaDB 용 SQL 생성문
-- ============================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS modern_space_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE modern_space_db;

-- ============================================
-- 1. 사용자 테이블 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자명',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시)',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '이메일',
    role ENUM('admin', 'user') DEFAULT 'user' COMMENT '권한 (관리자/일반)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보 테이블';

-- ============================================
-- 2. 게시글 테이블 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 ID',
    title VARCHAR(200) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    author VARCHAR(50) NOT NULL COMMENT '작성자명',
    user_id INT UNSIGNED DEFAULT NULL COMMENT '사용자 ID (외래키)',
    notice_type ENUM('none', 'notice', 'info') DEFAULT 'none' COMMENT '공지 타입 (없음/공지/안내)',
    views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '조회수',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    deleted_at DATETIME DEFAULT NULL COMMENT '삭제일',
    INDEX idx_created_at (created_at),
    INDEX idx_author (author),
    INDEX idx_notice_type (notice_type),
    INDEX idx_is_deleted (is_deleted),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시글 테이블';

-- ============================================
-- 3. 댓글 테이블 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 ID',
    post_id INT UNSIGNED NOT NULL COMMENT '게시글 ID',
    author VARCHAR(50) NOT NULL COMMENT '작성자명',
    user_id INT UNSIGNED DEFAULT NULL COMMENT '사용자 ID (외래키)',
    content TEXT NOT NULL COMMENT '댓글 내용',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    deleted_at DATETIME DEFAULT NULL COMMENT '삭제일',
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at),
    INDEX idx_author (author),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='댓글 테이블';

-- ============================================
-- 4. 첨부파일 테이블 (attachments)
-- ============================================
CREATE TABLE IF NOT EXISTS attachments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '첨부파일 ID',
    post_id INT UNSIGNED NOT NULL COMMENT '게시글 ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT UNSIGNED NOT NULL COMMENT '파일 크기 (byte)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME 타입',
    download_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '다운로드 횟수',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일',
    INDEX idx_post_id (post_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='첨부파일 테이블';

-- ============================================
-- 5. 게시판 카테고리 테이블 (categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '카테고리명',
    description VARCHAR(255) DEFAULT NULL COMMENT '설명',
    display_order INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '표시 순서',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='게시판 카테고리 테이블';

-- ============================================
-- 초기 데이터 삽입 (INSERT)
-- ============================================

-- 기본 카테고리 데이터
INSERT INTO categories (name, description, display_order) VALUES
('공지사항', '중요 공지사항 게시판', 1),
('자유게시판', '자유로운 주제 게시판', 2),
('Q&A', '질문과 답변 게시판', 3),
('정보공유', '유용한 정보 공유 게시판', 4);

-- 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@modernspace.com', 'admin');

-- 샘플 게시글 데이터
INSERT INTO posts (title, content, author, user_id, notice_type, views, created_at) VALUES
('환영합니다! 게시판 사용을 위한 공지사항입니다.', 
 '안녕하세요! Modern Space 게시판에 오신 것을 환영합니다.\n\n이 게시판은 자유롭게 소통하고 정보를 공유할 수 있는 공간입니다.\n\n게시판 이용 시 아래 규칙을 준수해 주세요:\n1. 타인을 존중하는 예절을 지켜주세요.\n2. 스팸 및 광고 게시물은 금지됩니다.\n3. 타인의 개인정보를 게시하지 마세요.', 
 '운영자', 1, 'notice', 1203, '2024-05-20 09:00:00'),

('프로젝트 시작 전에 기획서 어떻게 작성하시나요?', 
 '안녕하세요! 웹 개발을 시작한 지 얼마 안 된 초보 개발자입니다.\n\n현재 새로운 프로젝트를 시작하려고 하는데, 기획서를 어떻게 작성해야 할지 고민이 많습니다.\n\n경험 있는 분들이나 회사에서는 보통 어떤 항목을 포함해서 기획서를 작성하시나요?\n\n특히 다음과 같은 항목이 궁금합니다:\n- 프로젝트 목표 및 범위\n- 기능 요구사항 목록\n- 기술 스택 선정 이유\n- 개발 일정 및 마일스톤\n- 예상되는 문제점과 해결 방안\n\n조언해 주시면 정말 감사하겠습니다!', 
 '김철수', NULL, 'none', 45, '2024-05-19 14:00:00'),

('최신 웹 디자인 트렌드 공유합니다.', 
 '최근 웹 디자인 트렌드에 대해 정리해 보았습니다.\n\n1. 다크 모드 디자인\n2. 그라데이션 활용\n3. 미니멀리즘\n4. 마이크로 인터랙션\n5. 3D 요소 활용\n\n이러한 트렌드들을 잘 활용하면 더 매력적인 웹사이트를 만들 수 있습니다.\n\n참고가 되셨길 바랍니다!', 
 '이디자인', NULL, 'none', 128, '2024-05-18 16:30:00'),

('HTML/CSS 질문 있는데요, 도와주실 분?', 
 'CSS Flexbox와 Grid 차이점이 정확히 뭔가요?\n\n언제 Flexbox를 쓰고, 언제 Grid를 써야 할지 헷갈립니다.\n\n간단한 예시와 함께 설명해 주시면 정말 감사하겠습니다.', 
 '초보코더', NULL, 'none', 12, '2024-05-18 11:20:00'),

('오늘 점심 맛집 추천 부탁드려요~', 
 '사무실 근처 점심 맛집 찾고 있어요.\n\n한식, 중식, 일식 상관없습니다.\n가격은 1만원 전후로 좋아요.\n\n맛있는 곳 알려주세요!', 
 '박배고픔', NULL, 'none', 34, '2024-05-17 12:30:00'),

('서버 점검 안내 (5/25)', 
 '안녕하세요!\n\n2024년 5월 25일 서버 점검을 진행할 예정입니다.\n\n- 점검 시간: 2024년 5월 25일 오전 2시 ~ 오전 6시\n- 점검 내용: 시스템 안정화 및 기능 개선\n\n점검 기간 동안 서비스 이용이 불가능하니 양해 부탁드립니다.\n\n감사합니다.', 
 '운영팀', 1, 'info', 560, '2024-05-16 10:00:00');

-- 샘플 댓글 데이터
INSERT INTO comments (post_id, author, user_id, content, created_at) VALUES
(2, '이시니어', NULL, '안녕하세요! 기획서 작성에 대한 경험을 공유해 드릴게요. 먼저 사용자 스토리(User Story)를 작성하는 것부터 시작하는 것을 추천합니다. "사용자로서, ~하고 싶다. 그래서 ~을 한다." 형식으로 작성하면 좋습니다.', '2024-05-19 14:32:00'),
(2, '개발자A', NULL, '저는 항상 와이어프레임을 먼저 그리고 기획서를 작성합니다. 시각적인 요소를 먼저 정리하고 나면 기능 명세가 훨씬 수월해져요. Figma나 Sketch 같은 툴을 추천합니다!', '2024-05-19 15:45:00'),
(2, '코딩고수', NULL, '팀 프로젝트라면 Notion이나 Confluence 같은 협업 툴을 사용하는 것도 좋아요. 실시간으로 협업할 수 있어서 효율적입니다.', '2024-05-19 18:20:00');

-- ============================================
-- 자주 사용하는 쿼리 예시
-- ============================================

-- 게시글 목록 조회 (최신순, 공지사항 우선)
/*
SELECT 
    id, 
    title, 
    author, 
    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_date,
    views,
    notice_type
FROM posts
WHERE is_deleted = FALSE
ORDER BY 
    CASE WHEN notice_type != 'none' THEN 0 ELSE 1 END,
    created_at DESC
LIMIT 10;
*/

-- 게시글 상세 조회 (조회수 증가 포함)
/*
UPDATE posts SET views = views + 1 WHERE id = ?;
SELECT * FROM posts WHERE id = ?;
*/

-- 댓글 목록 조회
/*
SELECT 
    c.id,
    c.author,
    c.content,
    DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i') AS created_date
FROM comments c
WHERE c.post_id = ? AND c.is_deleted = FALSE
ORDER BY c.created_at ASC;
*/

-- 검색 (제목 또는 작성자)
/*
SELECT 
    id, 
    title, 
    author, 
    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_date,
    views,
    notice_type
FROM posts
WHERE is_deleted = FALSE
  AND (title LIKE ? OR author LIKE ?)
ORDER BY created_at DESC
LIMIT 10;
*/
