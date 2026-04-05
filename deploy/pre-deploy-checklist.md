# Pre-deploy Checklist

이 문서는 배포 전 점검 항목을 운영용으로만 관리합니다.  
배포 이미지/패키지에는 포함되지 않도록 저장소 문서로만 유지합니다.

## 공통

- 변경 건수가 master 반영 전인지 확인
- `git status`가 dirty 상태가 아닌지 확인
- `JWT_SECRET`과 `POSTGRES_PASSWORD`가 실제 배포 환경값인지 확인
- `.env.docker` 또는 배포용 환경 변수 스크립트가 최신인지 확인
- `git tag` 기준 버전이 릴리스 노트/체인지로그와 일치하는지 확인

## 이미지 빌드/배포 전 검증

- `docker compose -f docker-compose.yml config` 또는 `docker compose --env-file ... config`로 의존성/환경 변수를 점검
- `dandacompany/deskrpg:<tag>`로 교체해 배포 전 이미지 풀/기동 확인
  - `docker pull`
  - `docker compose --env-file .env.docker up -d`
  - `docker compose ps`
  - `curl -I http://localhost:3102`  (`307 Temporary Redirect` 확인)

## OpenClaw 통합(필요 시)

- `deskrpg-app` 컨테이너가 `openclaw` 서비스 healthy 상태를 기다리는지 확인
- `OPENCLAW_TOKEN`, `OPENCLAW_MODEL` 값 점검
- 대시보드에서 provider/model onboarding이 완료되어 있는지 확인
- 앱 설정에서 OpenClaw URL/Token이 실제 값과 일치하는지 확인

## 장애 예방 체크

- 최근 에러 로그에서 startup crash가 재현되는지 여부 확인
  - `docker compose logs deskrpg-app`
- 마이그레이션이 자동 실행되었는지 확인
  - `[migrate] Drizzle migrations applied successfully.` 로그 존재
- 기본 라우트 접근(필요 시 `/auth` 리다이렉트) 및 핵심 화면 1회 진입 확인

## 승인

- 위 항목을 통과한 뒤
  - Release PR 또는 배포 요청 메시지에 링크 첨부
  - `pre-deploy` 문서 체크 완료 상태 기록
