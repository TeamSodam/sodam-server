![image](https://user-images.githubusercontent.com/81923229/148949733-70b1d338-cae1-4c7e-a77a-17e912bd93a5.png)

## *🎁  소품샵 여정의 이야기를 담다, Sodam  🎁*

우리의 소품샵 방문 경험을 더욱 가치있게 만들어 주는 소담입니다!

소담과 함께 우리의 소품샵 추억을 간직해 보는건 어떠세요?

## 📋 IA 
![IA](https://user-images.githubusercontent.com/81923229/149041451-96cdc9bb-7a0a-4176-b2f0-c4fad5db0fc5.png)


## ✏️ DB ERD
![sodam-db](https://user-images.githubusercontent.com/81923229/148952075-b8fbce5c-ea3f-498c-ba9b-b97e1a918337.png)


## ♟ commit, coding convention, branch 전략

### 📍  commit 전략

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

### 📍  coding convention
- .eslintrc.js
```javascript
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
```javascript
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

### 📍  branch 전략

- 배포 브랜치 : `main`
- 개발 브랜치 : `develop`
- pr 단위 브랜치 + 뒤에 이슈 번호 붙이기
    - `feature/`
    - `fix/`
    - `refact/`
    - `hotfix/`

### 📍  PR, 이슈 관리

💡 하나의 이슈를 올리면 거기서의 todo 단위로 pr 날리기

## 🏛  프로젝트 폴더 구조
```
├── README.md
├── appspec.yml
├── image
│   ├── IA.png
│   └── sodam-db.png
├── package-lock.json
├── package.json
└── src
    ├── app.js
    ├── config
    │   └── dbConfig.js
    ├── constants
    │   ├── jwt.js
    │   ├── responseMessage.js
    │   └── statusCode.js
    ├── db
    │   ├── db.js
    │   ├── index.js
    │   └── user.js
    ├── lib
    │   ├── convertSnakeToCamel.js
    │   └── util.js
    ├── middlewares
    │   └── auth.js
    └── routes
        ├── index.js
        └── user
            ├── index.js
            └── userGET.js
```

## 🕸  전체 API 로직 구현 진척도 (수정중)
[API 명세서](https://scrawny-trust-955.notion.site/API-8dcea38436014055a8890adba05bd8b5) 

각자 할당된 api 개발 진행 중, 완성된 api 없음.

## 👨‍👩‍👦  팀별 역할 분담
| 박나희 | 이정은 | 최유림 |
| --- | --- | --- |
|  🐱 [Nahee-Park](https://github.com/Nahee-Park) | 🐱 [LeeJE20](https://github.com/LeeJE20)  | 🐱 [choiyoorim](https://github.com/choiyoorim) |
| 기록 및 문서화 담당 (리드미, 노션) | 팀 운영 담당 (일정조율, 회의 진행, 공지) | Task managing (칸반보드 관리 담당) |
| 기술 담당 (코드 리뷰, 기술적인 이슈, 타 파트와의 소통) | 협업 담당 (페어 프로그래밍, 개발 컨벤션 체크, 필요한 소통이 잘 이뤄지는지) | 과제 담당 (과제 제출 기한, 과제 제출 여부 체크) |
|  |  | 돈기부여 (안 지킨 날에 벌금 기록) |


