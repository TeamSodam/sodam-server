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
  const browser = await puppeteer.launch(); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  try {
    await page.setJavaScriptEnabled(true);
    await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723&filterType=%EC%97%85%EC%B2%B4%EC%82%AC%EC%A7%84`, {
      waitUntil: 'networkidle0',
    });
  } catch {
    return 'timeout error';
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
    return 'no image';
  }
};

const getShopIdFromUrl = (url) => {
  const splitUrl = url.split('/');
  const paramAndQuery = splitUrl[splitUrl.length - 1].split('?');
  const shopId = paramAndQuery[0];
  return shopId;
};

const ExecuteCrawling = async (keyword, id) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setDefaultNavigationTimeout(0);
  const resultObj = {
    shopName: keyword,
    shopId: id,
    img: [],
  };
  try {
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
const unPackedImagePromise = async (imagePromiseList, client) => {
  await Promise.allSettled(imagePromiseList).then((image) => {
    image.map((result) => {
      if (result.status === 'fulfilled') {
        console.log('[FULFILLED] image result', result.value);
        const shopImageObj = result.value;
        const isInsertSuccess = await insertShopImageDataToDb(shopImageObj, client);
        console.log('isInsertSuccess?', isInsertSuccess);
        shopImageJson[shopImageObj.shopId] = shopImageObj;
        shopImageArr.push(shopImageObj);
      } else {
        console.log('[ERROR] Promise status rejected', result.reason);
        //   rejected promise list만들어서 그 안에 shopName이랑 shopId 넣기
        shopRejectedArr.push(result.reason);
      }
    });
  });

  console.log('shopRejectedArr', shopRejectedArr);

  //   rejected된 애들을 다시 돌려서 promise배열 만들고 재귀적 호출
  if (shopRejectedArr.length >= 1) {
    const rejectedImagePromiseList = shopRejectedArr.map((item) => {
      if (item.shopName && item.shopId) {
        return ExecuteCrawling(item.shopName, item.shopId);
      }
    });
    unPackedImagePromise(rejectedImagePromiseList, client);
  } else {
    return shopImageArr;
  }
  // rejected배열 초기화
  shopRejectedArr = [];
};

const connectWithDb = async () => {
  let client;
  // 1. shopId와 shopName 가져오기
  try {
    client = await db.connect();
    const shopInfo = await shopDB.getAllShopNameAndShopId(client);
    // 테스트용
    // const tempList = [
    //   { shopId: 16, shopName: '무유무유' },
    //   { shopId: 17, shopName: '르시뜨피존' },
    //   { shopId: 18, shopName: '호시노앤쿠키스' },
    //   { shopId: 20, shopName: '비아케이스튜디오' },
    //   { shopId: 23, shopName: '드래곤플라이' },
    //   { shopId: 27, shopName: 'SHOP 209' },
    //   { shopId: 28, shopName: '룸코펜하겐' },
    //   { shopId: 29, shopName: '스테이앤틱' },
    //   { shopId: 25, shopName: '슈퍼스마일샵' },
    //   { shopId: 14, shopName: '리리림' },
    //   { shopId: 22, shopName: '런빠뉴' },
    //   { shopId: 11, shopName: '데이글로우' },
    //   { shopId: 24, shopName: '소금상점' },
    //   { shopId: 19, shopName: '데일리라이크' },
    //   { shopId: 8, shopName: '늬은' },
    //   { shopId: 4, shopName: '가온누리홈' },
    //   { shopId: 12, shopName: '팝뷰글' },
    //   { shopId: 26, shopName: '시그니처 루덴스' },
    //   { shopId: 21, shopName: '노블레스몰' },
    //   { shopId: 15, shopName: '코지블루' },
    //   { shopId: 31, shopName: '메종드리라' },
    //   { shopId: 32, shopName: '꼼마홈' },
    //   { shopId: 33, shopName: '루시데코디자인' },
    //   { shopId: 34, shopName: '마루상회' },
    //   { shopId: 35, shopName: '머쉬룸' },
    //   { shopId: 38, shopName: 'HAY' },
    //   { shopId: 42, shopName: '세리룸' },
    //   { shopId: 43, shopName: '두살차이' },
    //   { shopId: 45, shopName: '더나인몰' },
    //   { shopId: 46, shopName: '자라홈' },
    //   { shopId: 47, shopName: '핀즐' },
    //   { shopId: 48, shopName: '파스텔뮤지엄' },
    //   { shopId: 51, shopName: '킨포크' },
    //   { shopId: 52, shopName: '샨탈서울' },
    //   { shopId: 53, shopName: '리필리' },
    //   { shopId: 54, shopName: '라테사' },
    //   { shopId: 55, shopName: '펜두카' },
    //   { shopId: 56, shopName: '땅뜨디자인 쇼룸' },
    //   { shopId: 58, shopName: '앙뜨' },
    //   { shopId: 44, shopName: '투 스페이스 캔들' },
    //   { shopId: 37, shopName: '위드테이블' },
    //   { shopId: 41, shopName: '띠용마켓' },
    //   { shopId: 36, shopName: '포커시스' },
    //   { shopId: 40, shopName: '데이그로우' },
    //   { shopId: 49, shopName: '피터스팬토리' },
    //   { shopId: 30, shopName: '더블유제이' },
    //   { shopId: 50, shopName: '나이스웨더' },
    //   { shopId: 59, shopName: '디저트신드롬' },
    //   { shopId: 60, shopName: '키오스크키오스크' },
    //   { shopId: 61, shopName: '쿠나장롱' },
    //   { shopId: 63, shopName: '더 패브' },
    //   { shopId: 64, shopName: '로프트레다' },
    //   { shopId: 66, shopName: '기쁨의 발견 2호점' },
    //   { shopId: 67, shopName: '메이드바이 성수' },
    //   { shopId: 68, shopName: '기쁨의 발견 1호점' },
    //   { shopId: 69, shopName: '위티스' },
    //   { shopId: 70, shopName: '도시의 실험실 LITC' },
    //   { shopId: 72, shopName: '헤븐센스' },
    //   { shopId: 73, shopName: '오브뉴' },
    //   { shopId: 74, shopName: '여행상점' },
    //   { shopId: 75, shopName: '위모먼트' },
    //   { shopId: 76, shopName: '커먼키친' },
    // ];

    // 비동기적 로직 => 요청수 제한으로 인해 rejected가 많음. 재귀함수로 rejected요청 없을 때까지 돌리기
    const imagePromiseList = tempList.map((item) => {
      return ExecuteCrawling(item.shopName, item.shopId);
    });

    // 재귀적으로 프로미수 다룰 함수
    const resultArray = await unPackedImagePromise(imagePromiseList, client);
    console.log('>>resultArray', resultArray);

    // 디버깅을 위해 json파일로 데이터 저장
    fs.writeFile('shopImg.json', JSON.stringify(shopImageJson), (err) => {
      if (err) {
        console.log('[ERROR] file write err', err);
      } else {
        console.log('[SUCCESS] file write success');
      }
    });
  } catch (err) {
    console.log('err', err);
  } finally {
    client.release();
  }
};

connectWithDb();
