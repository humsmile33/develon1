# Supabase MCP Server 설치 가이드

## 1. MCP 서버 설치

Supabase MCP 서버를 설치하려면 터미널에서 다음 명령을 실행하세요:

```bash
npm install -g @supabase/mcp-server
```

또는 npx를 사용하여 설치하지 않고 바로 실행할 수도 있습니다.

## 2. Claude Desktop (Cline) 설정

Cline을 사용 중이시므로 VSCode의 MCP 설정을 확인해야 합니다.

### VSCode 설정 파일 위치

Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-vscode\settings\cline_mcp_servers.json`

또는 VSCode에서 MCP 서버를 직접 설정하는 방법을 확인해 주세요.

### MCP 서버 설정

설정 파일에 다음 내용을 추가하세요:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_60678a57b24d0c2cfad40be81aa75d3a6eae0bb2",
        "SUPABASE_PROJECT_URL": "https://wfzgznipfvkcgqnfwvuk.supabase.co"
      }
    }
  }
}
```

## 3. 설정 후 재시작

설정을 저장한 후 VSCode (또는 Cline)를 재시작하세요.

## 4. 연결 확인

재시작 후 Cline이 Supabase MCP 서버를 인식하는지 확인하세요.

## 5. 다음 단계

MCP 서버가 연결되면 다음 작업을 진행할 수 있습니다:
- 테이블 생성
- 초기 데이터 삽입
- 데이터 조회 및 관리

---

## 참고: 직접 SQL 실행 방법

MCP 서버 설치가 어려운 경우, 아래 PostgreSQL SQL을 Supabase Dashboard의 SQL Editor에서 직접 실행할 수도 있습니다.
