const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const db = require('../db/db');
const { shopDB } = require('../db');

process.setMaxListeners(500);

// 기획분들과의 공유를 위해 csv파일로 데이터 저장
const csvWriter = createCsvWriter({
  path: 'shopImgCrawling2.csv',
  header: [
    { id: 'shopId', title: '소품샵 id' },
    { id: 'shopName', title: '소품샵 이름' },
    { id: 'image', title: '소품샵 이미지' },
    { id: 'isPreview', title: '대표 사진 여부' },
  ],
});

const getImage = async (shopId) => {
  console.log('shopId>>>shopId', shopId);
  let browser;
  let page;
  try {
    browser = await puppeteer.launch(); // headless 브라우저 실행
    page = await browser.newPage(); // 새로운 페이지 열기
    await page.setJavaScriptEnabled(true);
    // 업체 사진만
    // await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723&filterType=%EC%97%85%EC%B2%B4%EC%82%AC%EC%A7%84`, {
    //   waitUntil: 'networkidle0',
    // });
    // 전체 사진
    await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723`, {
      waitUntil: 'networkidle0',
    });
  } catch {
    return Promise.reject('[SUCCESS] timeout error');
  }

  try {
    await page.waitForSelector('._3TiO6', { visible: true, timeout: 50000 });
    const content = await page.content();
    const $ = cheerio.load(content);
    const $img = $('img');
    const imgSources = [];
    $img.each((_, elem) => {
      imgSources.push(elem.attribs.src);
    });

    return imgSources;
  } catch (err) {
    console.log(err);
    return Promise.reject('no image');
  }
};

const getShopIdFromUrl = (url) => {
  const splitUrl = url.split('/');
  const paramAndQuery = splitUrl[splitUrl.length - 1].split('?');
  const shopId = paramAndQuery[0];
  return shopId;
};

const ExecuteCrawling = async (keyword, id) => {
  let browser;
  let page;
  const resultObj = {
    shopName: keyword,
    shopId: id,
    img: [],
  };
  try {
    browser = await puppeteer.launch();
    page = await browser.newPage(); // 새로운 페이지 열기
    await page.setDefaultNavigationTimeout(0);
    await page.setJavaScriptEnabled(true);
    await page.goto(`https://map.naver.com/v5/search/${keyword}?c=14137173.7122868,4521234.4977928,15,0,0,0,dh`, { waitUntil: 'networkidle0' });

    const frameUrl = await page.frames()[0]._url;
    const shopId = getShopIdFromUrl(frameUrl);
    if (typeof shopId === 'number') {
      const imageArray = await getImage(shopId);
      await browser.close();
      // console.log('imageArray', imageArray);
      resultObj.img = imageArray;
      return resultObj;
    } else {
      // 리스트 요소 중 첫번째를 클릭한 이후 shopId에 해당하는 돔 찾기
      const elementHandle = await page.$('#searchIframe');
      const searchResultFrame = await elementHandle.contentFrame();
      await searchResultFrame.waitForSelector('a._3LMxZ:first-child', { visible: true, timeout: 50000 });
      await searchResultFrame.click('a._3LMxZ:first-child');

      await page.waitForSelector('#entryIframe', { visible: true, timeout: 50000 });

      const entryIframe = await page.$('#entryIframe');
      const shopInfoIframe = await entryIframe.contentFrame();
      const shopInfoIframeUrl = shopInfoIframe._frameManager._mainFrame._url;
      const newShopId = getShopIdFromUrl(shopInfoIframeUrl);
      const imageArray = await getImage(newShopId);
      await browser.close();
      // console.log('imageArray', imageArray);
      resultObj.img = imageArray;
      return resultObj;
    }
  } catch (err) {
    resultObj.img = '[SUCCESS] timeout err';
    // if (typeof err === 'object') {
    //   const errString = err.toString();
    //   if (errString.includes('a._3LMxZ:first-child')) {
    //     resultObj.img = '[SUCCESS] no result';
    //     return resultObj;
    //   }
    // }
    return Promise.reject(resultObj);
  }
};

// 이미지 db에 저장
const insertShopImageDataToDb = async (shopImgObj, client) => {
  console.log('들어온 객체 데이터', shopImgObj);
  if (typeof shopImgObj.img === 'string') {
    return '[SUCCESS] no image Data';
  }

  for (let i = 0; i <= 3; i++) {
    if (!shopImgObj.img[i]) {
      break;
    }
    const shopId = Number(shopImgObj.shopId);
    let isPreview = false;
    if (i === 0) {
      isPreview = true;
    } else {
      isPreview = false;
    }

    const shopImg = shopImgObj.img[i].replace('type=f180_180', 'type=w750');
    const shopImgInfo = await shopDB.insertShopImage(client, shopId, shopImg, isPreview);
    console.log('insert return value', shopImgInfo);
    const shopImageArr = [
      {
        shopId: shopImgInfo[0].shopId,
        shopName: shopImgObj.shopName,
        image: shopImg,
        isPreview,
      },
    ];
    csvWriter.writeRecords(shopImageArr).then(() => console.log('[SUCCESS] CSV file was written successfully'));
  }
  return '[SUCCESS] insert image Data';
};

// TODO 전역변수 지양하는 방식으로 수정
const shopImageArr = [];
let shopRejectedArr = [];
const shopImageJson = {};
const shopRejectedArrLength = [];
let currentIdx = 0;
const unPackedImagePromise = async (imagePromiseList) => {
  await Promise.allSettled(imagePromiseList).then((image) => {
    image.map((result) => {
      if (result.status === 'fulfilled') {
        console.log('[FULFILLED] image result', result.value);
        const shopImageObj = result.value;
        shopImageJson[shopImageObj.shopId] = shopImageObj;
        shopImageArr.push(shopImageObj);
      } else {
        console.log('[ERROR] Promise status rejected', result.reason);
        //   rejected promise list만들어서 그 안에 shopName이랑 shopId 넣기
        shopRejectedArr.push(result.reason);
      }
    });
  });

  console.log('[&&&&&&&] shopImageArr', shopImageArr);
  console.log('[&&&&&&&] shopRejectedArr', shopRejectedArr);

  //   rejected된 애들을 다시 돌려서 promise배열 만들고 재귀적 호출
  if (shopRejectedArr.length >= 1) {
    shopRejectedArrLength.push(shopRejectedArr.length);
    console.log('currentIdx', currentIdx);
    console.log('shopRejectedArrLength', shopRejectedArrLength);
    if (
      shopRejectedArrLength.length >= 3 &&
      shopRejectedArrLength[currentIdx - 2] === shopRejectedArrLength[currentIdx - 1] &&
      shopRejectedArrLength[currentIdx - 1] === shopRejectedArrLength[currentIdx]
    ) {
      return shopImageArr;
    }
    currentIdx += 1;
    const rejectedImagePromiseList = shopRejectedArr.map((item) => {
      if (item.shopName && item.shopId) {
        return ExecuteCrawling(item.shopName, item.shopId);
      }
    });
    // rejected배열 초기화
    shopRejectedArr = [];
    return unPackedImagePromise(rejectedImagePromiseList);
  } else {
    return shopImageArr;
  }
};

const connectWithDb = async () => {
  let client;
  // 1. shopId와 shopName 가져오기
  try {
    client = await db.connect();
    const shopInfo = await shopDB.getAllShopNameAndShopId(client);

    // 테스트용
    // const tempList = [
    //   { shopId: 1, shopName: '홈리학', landAddress: '서울 송파구 풍납동 407-7' },
    //   { shopId: 2, shopName: '기쁨의 발견', landAddress: '서울 광진구 화양동 34-1 2층' },
    //   { shopId: 3, shopName: '브리앙', landAddress: '서울 강남구 개포동 172 지하 1층' },
    //   { shopId: 4, shopName: '가온누리홈', landAddress: '서울 광진구 자양동 606-42 1층' },
    //   { shopId: 5, shopName: '마요', landAddress: '서울 강남구 논현동 53-4 효진빌딩 1층' },
    //   {
    //     shopId: 6,
    //     shopName: '마레101',
    //     landAddress: '서울 서초구 잠원동 29-25 아트빌딩 1층',
    //   },
    //   {
    //     shopId: 7,
    //     shopName: '멜로우',
    //     landAddress: '서울 강남구 개포동 13-3 상가 1층 115호 멜로우',
    //   },
    //   { shopId: 8, shopName: '늬은', landAddress: '서울 강남구 도곡동 454-15 2층' },
    //   {
    //     shopId: 9,
    //     shopName: '플라운더룸',
    //     landAddress: '서울 강남구 삼성동 159 스타필드코엑스 지하1층 N109호',
    //   },
    //   {
    //     shopId: 10,
    //     shopName: '사피코리아',
    //     landAddress: '서울 강남구 삼성동 115-27 금척타워 6층',
    //   },
    //   { shopId: 11, shopName: '데이글로우', landAddress: '서울 송파구 삼전동 96-9 1층' },
    //   {
    //     shopId: 12,
    //     shopName: '팝뷰글',
    //     landAddress: '서울 송파구 삼전동 98-11 지하 1층',
    //   },
    //   {
    //     shopId: 13,
    //     shopName: '벨에포크',
    //     landAddress: '서울 송파구 송파동 56-2 103호 벨에포크',
    //   },
    //   { shopId: 14, shopName: '리리림', landAddress: '서울 송파구 송파동 43-9 1층' },
    //   {
    //     shopId: 15,
    //     shopName: '코지블루',
    //     landAddress: '서울 송파구 송파동 45-5 3층 302호',
    //   },
    //   { shopId: 16, shopName: '무유무유', landAddress: '서울 강남구 역삼동 813 1층' },
    //   {
    //     shopId: 17,
    //     shopName: '르시뜨피존',
    //     landAddress: '서울 강남구 신사동 524-13 1층',
    //   },
    //   {
    //     shopId: 18,
    //     shopName: '호시노앤쿠키스',
    //     landAddress: '서울 강남구 신사동 520-5 5층',
    //   },
    //   {
    //     shopId: 19,
    //     shopName: '데일리라이크',
    //     landAddress: '서울 강남구 신사동 523-25 1층',
    //   },
    //   {
    //     shopId: 20,
    //     shopName: '비아케이스튜디오',
    //     landAddress: '서울 강남구 신사동 544-17 2층',
    //   },
    //   {
    //     shopId: 21,
    //     shopName: '노블레스몰',
    //     landAddress: '서울 강남구 청담동 83-1 1층 노블레스몰',
    //   },
    //   { shopId: 22, shopName: '런빠뉴', landAddress: '서울 강남구 청담동 85-4 위워크' },
    //   { shopId: 23, shopName: '드래곤플라이', landAddress: '서울 강남구 청담동 122' },
    //   {
    //     shopId: 24,
    //     shopName: '소금상점',
    //     landAddress: '서울 송파구 잠실동 206-5 105호',
    //   },
    //   {
    //     shopId: 25,
    //     shopName: '슈퍼스마일샵',
    //     landAddress: '서울 송파구 방이동 64-8 603호',
    //   },
    //   {
    //     shopId: 26,
    //     shopName: '시그니처 루덴스',
    //     landAddress: '서울 송파구 신천동 29 롯데월드몰 5층',
    //   },
    //   {
    //     shopId: 27,
    //     shopName: 'SHOP 209',
    //     landAddress: '서울 송파구 신천동 29-1 1층',
    //   },
    //   {
    //     shopId: 28,
    //     shopName: '룸코펜하겐',
    //     landAddress: '서울 송파구 잠실동 40-1 롯데백화점 10층',
    //   },
    //   { shopId: 29, shopName: '스테이앤틱', landAddress: '서울 강남구 청담동 134-20' },
    //   {
    //     shopId: 30,
    //     shopName: '더블유제이',
    //     landAddress: '서울 강남구 논현동 125-8 1,2층 2층 WJ더블유제이',
    //   },
    //   {
    //     shopId: 31,
    //     shopName: '메종드리라',
    //     landAddress: '서울 강남구 논현동 217-48 101호',
    //   },
    //   {
    //     shopId: 32,
    //     shopName: '꼼마홈',
    //     landAddress: '서울 강남구 논현동 151-3 대영빌딩 3층',
    //   },
    //   {
    //     shopId: 33,
    //     shopName: '루시데코디자인',
    //     landAddress: '서울 강남구 대치동 912-3 지하1층',
    //   },
    //   { shopId: 34, shopName: '마루상회', landAddress: '서울 강남구 대치동 931-16' },
    //   { shopId: 35, shopName: '머쉬룸', landAddress: '서울 강남구 신사동 534-6 4층' },
    //   {
    //     shopId: 36,
    //     shopName: '포커시스',
    //     landAddress: '서울 강남구 압구정동 429 현대백화점 지하 1층',
    //   },
    //   {
    //     shopId: 37,
    //     shopName: '위드테이블',
    //     landAddress: '서울 강남구 신사동 544-13 지하1층',
    //   },
    //   { shopId: 38, shopName: 'HAY', landAddress: '서울 강남구 신사동 546-18' },
    //   { shopId: 39, shopName: '소봄', landAddress: '서울 강남구 신사동 552-3' },
    //   {
    //     shopId: 40,
    //     shopName: '데이그로우',
    //     landAddress: '서울 성동구 성수동2가 301-27 공간 와디즈 2층',
    //   },
    //   { shopId: 41, shopName: '띠용마켓', landAddress: '서울 광진구 군자동 1-1 2층' },
    //   { shopId: 42, shopName: '세리룸', landAddress: '서울 광진구 중곡동 172-63 1층' },
    //   {
    //     shopId: 43,
    //     shopName: '두살차이',
    //     landAddress: '서울 광진구 중곡동 74-64 1층 두살차이',
    //   },
    //   {
    //     shopId: 44,
    //     shopName: '투 스페이스 캔들',
    //     landAddress: '서울 광진구 화양동 16-16 투 스페이스 캔들공방',
    //   },
    //   {
    //     shopId: 45,
    //     shopName: '더나인몰',
    //     landAddress: '서울 광진구 자양동 13-1 덕유빌딩 1층',
    //   },
    //   {
    //     shopId: 46,
    //     shopName: '자라홈',
    //     landAddress: '서울 강남구 삼성동 159 코엑스몰 B1 E103',
    //   },
    //   {
    //     shopId: 47,
    //     shopName: '핀즐',
    //     landAddress: '서울 성동구 성수동2가 301-27 공간 와디즈 2층 스토어',
    //   },
    //   {
    //     shopId: 48,
    //     shopName: '파스텔뮤지엄',
    //     landAddress: '서울 성동구 성수동2가 301-27 공간 와디즈 2층 스토어',
    //   },
    //   {
    //     shopId: 49,
    //     shopName: '피터스팬토리',
    //     landAddress: '서울 성동구 성수동2가 301-27 공간 와디즈 2층 스토어',
    //   },
    //   { shopId: 50, shopName: '나이스웨더', landAddress: '서울 강남구 신사동 523-19' },
    // ];

    // 비동기적 로직 => 요청수 제한으로 인해 rejected가 많음. 재귀함수로 rejected요청 없을 때까지 돌리기
    const imagePromiseList = shopInfo.map((item) => {
      let keyword;
      if (item.landAddress) {
        const splitAddress = item.landAddress.split(' ');
        keyword = splitAddress[1] + ' ' + splitAddress[2] + ' ' + item.shopName;
      } else {
        keyword = item.area + ' ' + item.shopName;
      }
      return ExecuteCrawling(keyword, item.shopId);
    });

    // 재귀적으로 프로미스 다룰 함수
    const resultArr = await unPackedImagePromise(imagePromiseList);

    const shopImageJson = {};
    for (const shopData of resultArr) {
      const isInsertSuccess = await insertShopImageDataToDb(shopData, client);
      console.log('isInsertSuccess?', isInsertSuccess);
      shopImageJson[shopData.shopId] = shopData;
    }
    // 디버깅을 위해 json파일로 데이터 저장
    fs.writeFile('shopImg3.json', JSON.stringify(shopImageJson), (err) => {
      if (err) {
        console.log('[ERROR] file write err', err);
      } else {
        console.log('[SUCCESS] file write success');
      }
    });
    console.log('[&&&&&&&] 최종적으로 결과값 없는 소품샵', shopRejectedArr);
  } catch (err) {
    console.log('err', err);
  } finally {
    client.release();
  }
};

connectWithDb();
