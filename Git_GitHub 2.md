# Git/GitHub 2

### 1. GitHub 계정과 저장소 생성
● Git 저장소를 호스팅하는 서비스
● 계정을 만든 뒤 새 Repository를 생성하면 원격 저장소 주소(URL)가 발급

### 2. 원격 저장소
●  인터넷에 있는 Git 저장소
●  여러 사람이 같은 코드 공유
●  백업 역할
●  협업의 기준점

●  코드
$ git remote add origin 원격주소
$ git remote -v

### 3. git push / git pull
● 로컬과 원격 저장소를 동기화하는 명령어
- ● git push: 로컬 커밋을 원격 저장소로 올림
- ● git pull: 원격 변경 사항을 내려받아 로컬에 반영

● 로컬 커밋을 원격 저장소로 업로드
- $ git push -u origin main

● GitHub 웹에서 파일 추가 & 커밋 생성
● 원격 저장소의 변경 사항 다운로드
- $ git pull

### 4. 협업 상황에서 Git & GitHub 사용
[1] 팀장이 프로젝트 만들고, git init
[2] 팀장이 원격 저장소에 git push
[3] 팀원은 git clone으로 팀장의 프로젝트를 복사한다.
[4] 팀장 또는 팀원이 코드 작업 & git commit
[5] 팀장 또는 팀원이 git push
[6] 다른 팀원은 git pull을 해서 코드 동기화

### 5. GitHub 협업 예시
[1] 이슈를 생성하고, 담당자 지정
[2] 로컬 환경에서 코딩 & 커밋
[3] 브랜치 작업 내용을 원격 저장소로 push
[4] (main <- branch) Pull Request 생성
[5] PR 리뷰 & 코드 수정
[6] 관리자가 PR을 Merge
[7] 다른 팀원 작업 내용 동기화 Pull

### 6. HTML(HyperText Markup Language)
● HTML 이란?
- ● 웹 페이지의 구조를 정의하는 언어
- ● 글의 제목, 문단, 이미지, 링크 같은 웹 페이지의 뼈대를 만드는 역할

● 웹과 HTML
- ● 서버가 HTML 문서를 만들어서 브라우저에 전달
- ● 브라우저는 HTML을 읽고 화면의 기본 구조를 그림
- ● 서버 → HTML 전달 → 브라우저 → 화면 구조 생성

### 7. HTML 기본 구조
● HTML 문서는 항상 일정한 기본 틀을 가짐
● 태그(tag)들의 조합으로 구성
- ○ 태그는 <태그이름> 형태로 작성
- ○ 각 태그마다 요소의 의미와 역할을 가짐
- ○ 대부분의 태그는 여는 태그와 닫는 태그로 이루어짐

● 예시
<!DOCTYPE html>
  \<html>
  \<!-- 웹 페이지에 대한 설정/정보-->
  \<head>\<title>웹페이지 이름\</title>\</head>
  \<!-- 화면에 그려지는 영역-->
  \<body>
    \<!-- Heading -->  
    \<h1>제목\</h1>
    \<h2>제목\</h2>
    \<!-- 문단(paragraph) -->
    \<p>문장\</p>      
  \</body>

\</html>