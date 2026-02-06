# 🎨 Insta Grid - 인스타그램 피드 분할기

3장이 하나로 이어지는 인스타그램 피드 이미지를 쉽게 만들 수 있는 웹 도구입니다.

## ✨ 주요 기능

- 📸 이미지를 3장으로 자동 분할
- 🎯 자르기 기준점 선택 (상단/중앙/하단/좌측/우측)
- 📱 인스타그램 피드 비율 자동 조정 (3:4 → 4:5)
- 👀 실시간 피드 미리보기
- 💾 개별/전체 다운로드

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📦 배포

### Cloudflare Pages (GitHub 연동)
1. [Cloudflare Pages](https://pages.cloudflare.com/) 접속
2. "Create a project" → "Connect to Git"
3. GitHub 저장소 선택: `haileysunn/insta-grid`
4. **Build settings:**
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. "Save and Deploy"

이후 GitHub에 푸시할 때마다 자동 배포됩니다! 🎉

## 🛠️ 기술 스택

- React 18
- Vite
- Tailwind CSS
- Lucide React (아이콘)

## 📝 사용 방법

1. 이미지 업로드
2. 자르기 기준점 선택
3. "3장으로 분할하기" 클릭
4. 다운로드
5. 인스타그램에 **3 → 2 → 1** 순서로 업로드

## 📄 라이선스

MIT

---

## 💡 프로젝트 배경

이 프로젝트는 **Claude Sonnet 4 LLM**과의 대화형 코딩으로 약 20분 만에 완성되었습니다.

### 개발 워크플로우
1. 🤖 **Claude Sonnet 4** - AI 기반 코드 생성
2. 💻 **Firebase Studio** - 개발 환경 및 디버깅
3. 📦 **GitHub** - 소스 코드 버전 관리
4. 🚀 **Cloudflare Pages** - 자동 배포

### AI 협업 과정
- 💬 요구사항 설명 → 즉시 코드 생성
- 🔄 피드백 → 실시간 수정 및 디버깅
- 🎨 UI/UX 개선 → 반복 작업
- 🐛 오류 해결 → 즉각적인 수정

AI와 함께하는 새로운 개발 방식! 🚀