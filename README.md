![https://user-images.githubusercontent.com/81923229/148949733-70b1d338-cae1-4c7e-a77a-17e912bd93a5.png](https://user-images.githubusercontent.com/81923229/148949733-70b1d338-cae1-4c7e-a77a-17e912bd93a5.png)

## *🎁* **소품샵 여정의 이야기를 담다, Sodam** *🎁*

우리의 소품샵 방문 경험을 더욱 가치있게 만들어 주는 **소담**입니다!

소담과 함께 우리의 **소품샵 추억**을 간직해 보는건 어떠세요?

## ✨ **OUR SERVICE**

![image](https://user-images.githubusercontent.com/65010481/150520368-e9fa9c58-fcda-4cde-aa51-11633650fa88.png)
![image](https://user-images.githubusercontent.com/65010481/150520326-74c13f6c-5276-42fc-bf9c-de01363e0a35.png)


---
### VALUE OF OUR SERVICE

**1. 새로운 소품샵 추천**
    
    → 요즘 뜨는 소품샵 및 사용자 취향에 맞는 소품샵을 추천
    → 최근 업데이트된 리뷰 추천
    
**2. 목적별 소품샵 탐색**
    
    → 테마별 소품샵 탐색
    → 지역별 소품샵 탐색
    
**3. 소품샵 여정 아카이빙**
    
    → 가고싶은 소품샵 저장 ⇒ 소품샵 스크랩
    → 다녀온 소품샵 후기 기록 ⇒ 내가 작성한 리뷰
    → 다른 유저들의 소품샵 후기 스크랩 ⇒ 스크랩한 리뷰

## 👨‍👩‍👦 역할 분담

![리드미에 올릴것](https://user-images.githubusercontent.com/65010481/150528566-310f46b9-1a47-4f09-9af5-009e496c2f77.png)

</br>

## ✏️ DB ERD

![https://user-images.githubusercontent.com/81923229/148952075-b8fbce5c-ea3f-498c-ba9b-b97e1a918337.png](https://user-images.githubusercontent.com/81923229/148952075-b8fbce5c-ea3f-498c-ba9b-b97e1a918337.png)

## 📕 Cloud Service

- AWS EC2 - 클라우드 컴퓨팅 시스템
- AWS RDS - 클라우드 관계형 데이터베이스
- AWS S3 - 클라우드 데이터 저장소
- AWS Route 53 - 클라우드 DNS 웹 서비스
- AWS CodePipeline - 지속적 통합 및 지속적 전달 서비스
- AWS CodeDeploy - 애플리케이션 배포를 자동화하는 배포 서비스

## 📚 사용 도구

- Node.js
- Express.js
- NPM - 패키지 매니저
- PM2
- PostgresSQL

## 🔔 Dependencies

```json
 "dependencies": {
    "aws-sdk": "^2.1058.0",
    "axios": "^0.25.0",
    "cors": "^2.8.5",
    "dayjs": "^1.10.7",
    "dotenv": "^10.0.0",
    "express": "^4.17.2",
    "google-spreadsheet": "^3.2.0",
    "googleapis": "^39.2.0",
    "JSON": "^1.0.0",
    "jsonwebtoken": "^8.5.1",
    "multer": "^1.4.4",
    "multer-s3": "^2.10.0",
    "nodemon": "^2.0.15",
    "path": "^0.12.7",
    "pg": "^8.7.1",
    "sequelize": "^6.12.5",
    "sequelize-cli": "^6.3.0",
    "yamljs": "^0.3.0"
  }
```

## 🕸 API DOCS

↗️ [API 명세서](https://www.notion.so/API-8dcea38436014055a8890adba05bd8b5)

## ♟ commit, coding convention, branch 전략

### 📍 commit 전략

```
 제목 첫 글자를 대문자로
 제목은 명령문으로
 제목 끝에 마침표(.) 금지
 제목과 본문을 한 줄 띄워 분리하기
 본문은 "어떻게" 보다 "무엇을", "왜"를 설명한다.
 본문에 여러줄의 메시지를 작성할 땐 "-"로 구분

```

```
 ✨ [FEAT] : 새로운 기능 구현 #이슈번호
 🔨 [FIX] : 버그, 오류 해결 #이슈번호
 📝 [DOCS] : README나 WIKI 등의 문서 개정 #이슈번호
 💄 [STYLE] :  코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 #이슈번호
 ♻️ [REFACTOR] : 코드 리펙토링 #이슈번호
 ⚡️ [TEST] : 테스트 코드, 리펙토링 테스트 코드 추가 #이슈번호
 ✅ [CHORE] : 빌드 업무 수정, 패키지 매니저 수정 #이슈번호
 🧭 [DEV] :  개발 환경 세팅 #이슈번호
 ➕ [ADD] : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성 시 #이슈번호
 🚑️ [HOTFIX] : issue나, QA에서 급한 버그 수정에 사용 #이슈번호
 ⚰️ [DEL] : 쓸모없는 코드 삭제 #이슈번호
 ✏️ [CORRECT] : 주로 문법의 오류나 타입의 변경, 이름 변경 등에 사용합니다. #이슈번호
 🚚 [MOVE] : 프로젝트 내 파일이나 코드의 이동 #이슈번호
 ⏪️ [RENAME] : 파일 이름 변경이 있을 때 사용합니다. #이슈번호
 🔀 [MERGE]: 다른브렌치를 merge 할 때 사용합니다. #이슈번호

```

### 📍 coding convention

- .eslintrc.js

```
module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'eslint-config-prettier'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-prototype-builtins': 'off',
    'no-self-assign': 'off',
    'no-empty': 'off',
    'no-case-declarations': 'off',
    'consistent-return': 'off',
    'arrow-body-style': 'off',
    camelcase: 'off',
    quotes: 'off',
    'no-unused-vars': 'off',
    'comma-dangle': 'off',
    'no-bitwise': 'off',
    'no-use-before-define': 'off',
    'no-extra-boolean-cast': 'off',
    'no-empty-pattern': 'off',
    curly: 'off',
    'no-unreachable': 'off',
  },
};

```

- .prettierrc.js

```
module.exports = {
  bracketSpacing: true,
  jsxBracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'always',
  printWidth: 200,
  tabWidth: 2,
};
```

### 📍 Branch 전략

- 배포 브랜치 : `main`
- 개발 브랜치 : `develop`
- pr 단위 브랜치 + 뒤에 이슈 번호 붙이기
    - `feature/`
    - `fix/`
    - `refact/`
    - `hotfix/`


### 📍 PR, 이슈 관리

💡 하나의 이슈를 올리면 거기서 todo 단위로 pr 날리기


## 🏛 프로젝트 폴더 구조

```
📦sodam-server
 ┣ 📂.git
 ┣ 📂src
 ┃ ┣ 📂config
 ┃ ┃ ┗ 📜dbConfig.js
 ┃ ┣ 📂constants
 ┃ ┃ ┣ 📜jwt.js
 ┃ ┃ ┣ 📜responseMessage.js
 ┃ ┃ ┗ 📜statusCode.js
 ┃ ┣ 📂db
 ┃ ┃ ┣ 📜db.js
 ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┣ 📜review.js
 ┃ ┃ ┣ 📜shop.js
 ┃ ┃ ┣ 📜spreadsheet.js
 ┃ ┃ ┗ 📜user.js
 ┃ ┣ 📂lib
 ┃ ┃ ┣ 📜convertRawDataToProccessedData.js
 ┃ ┃ ┣ 📜convertSnakeToCamel.js
 ┃ ┃ ┣ 📜jwtHandlers.js
 ┃ ┃ ┗ 📜util.js
 ┃ ┣ 📂middlewares
 ┃ ┃ ┣ 📜auth.js
 ┃ ┃ ┣ 📜slackAPI.js
 ┃ ┃ ┗ 📜uploadImage.js
 ┃ ┣ 📂routes
 ┃ ┃ ┣ 📂auth
 ┃ ┃ ┃ ┣ 📜authLoginPOST.js
 ┃ ┃ ┃ ┣ 📜authSignupPOST.js
 ┃ ┃ ┃ ┗ 📜index.js
 ┃ ┃ ┣ 📂my
 ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┣ 📜myReviewGET.js
 ┃ ┃ ┃ ┗ 📜myScrapGET.js
 ┃ ┃ ┣ 📂review
 ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┣ 📜reviewLikePOST.js
 ┃ ┃ ┃ ┣ 📜reviewPOST.js
 ┃ ┃ ┃ ┣ 📜reviewRecentGET.js
 ┃ ┃ ┃ ┣ 📜reviewScrapPOST.js
 ┃ ┃ ┃ ┗ 📜reviewShopIdSortPageGET.js
 ┃ ┃ ┣ 📂shop
 ┃ ┃ ┃ ┣ 📜bookmarkGET.js
 ┃ ┃ ┃ ┣ 📜bookmarkPOST.js
 ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┣ 📜shopCategoryGET.js
 ┃ ┃ ┃ ┣ 📜shopGET.js
 ┃ ┃ ┃ ┣ 📜shopRecommendGET.js
 ┃ ┃ ┃ ┣ 📜shopReviewIdGET.js
 ┃ ┃ ┃ ┣ 📜shopSearchGET.js
 ┃ ┃ ┃ ┣ 📜shopShopIdGET.js
 ┃ ┃ ┃ ┗ 📜shopShopIdLocationGET.js
 ┃ ┃ ┣ 📂user
 ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┗ 📜userGET.js
 ┃ ┃ ┗ 📜index.js
 ┃ ┣ 📂script
 ┃ ┃ ┣ 📜insertReviewData.js
 ┃ ┃ ┣ 📜insertReviewImage.js
 ┃ ┃ ┣ 📜insertReviewItem.js
 ┃ ┃ ┣ 📜insertReviewTag.js
 ┃ ┃ ┣ 📜insertShop.js
 ┃ ┃ ┣ 📜insertTag.js
 ┃ ┃ ┗ 📜insertUser.js
 ┃ ┗ 📜app.js
 ┣ 📜.env
 ┣ 📜.eslintrc.js
 ┣ 📜.gitignore
 ┣ 📜.prettierrc.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┗ 📜README.md
```


