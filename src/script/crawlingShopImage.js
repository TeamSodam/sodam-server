const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const db = require('../db/db');
const { shopDB } = require('../db');

process.setMaxListeners(500);

// 기획분들과의 공유를 위해 csv파일로 데이터 저장
const csvWriter = createCsvWriter({
  path: 'shopImgCrawling3.csv',
  header: [
    { id: 'shopId', title: '소품샵 id' },
    { id: 'shopName', title: '소품샵 이름' },
    { id: 'image', title: '소품샵 이미지' },
    { id: 'isPreview', title: '대표 사진 여부' },
  ],
});

const csvWriter2 = createCsvWriter({
  path: 'noShopImg.csv',
  header: [
    { id: 'shopId', title: '소품샵 id' },
    { id: 'shopName', title: '소품샵 이름' },
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
let shopImageArr = [];
let shopRejectedArr = [];
const shopImageJson = {};
let shopRejectedArrLength = [];
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

const waitOneMin = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 60000);
  });
};

const connectWithDb = async () => {
  let client;
  // 1. shopId와 shopName 가져오기
  try {
    client = await db.connect();
    const shopInfo = await shopDB.getAllShopNameAndShopId(client);

    // 50개씩 끊어서 실행시킬 것ㅣㅁ
    let shopInfoArrLength = shopInfo.length / 50;
    if (shopInfo.length % 50 !== 0) {
      shopInfoArrLength += 1;
    }

    let index = 0;
    const newSyncArr = [];

    for (let i = 0; i < shopInfoArrLength; i++) {
      if (i !== shopInfoArrLength - 1) {
        newSyncArr.push([...shopInfo].slice(index, index + 50));
      } else {
        newSyncArr.push([...shopInfo].slice(index));
        break;
      }
      index += 50;
    }

    const shopImageJson = {};
    //50 단위로 동기적 로직, 그 내부는 비동기적 로직
    for (const shopInfoArr of newSyncArr) {
      // 비동기적 로직 => 요청수 제한으로 인해 rejected가 많음. 재귀함수로 rejected요청 없을 때까지 돌리기
      const imagePromiseList = shopInfoArr.map((item) => {
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

      for (const shopData of resultArr) {
        const isInsertSuccess = await insertShopImageDataToDb(shopData, client);
        console.log('isInsertSuccess?', isInsertSuccess);
        shopImageJson[shopData.shopId] = shopData;
      }
      csvWriter2.writeRecords(shopRejectedArr).then(() => console.log('[SUCCESS] rejected image CSV file was written successfully'));
      shopImageArr = [];
      shopRejectedArr = [];
      shopRejectedArrLength = [];
      currentIdx = 0;

      // 1분 쉬었다가 다음 비동기적 로직 실행
      await waitOneMin();
    }

    // 디버깅을 위해 json파일로 데이터 저장
    fs.writeFile('shopImg4.json', JSON.stringify(shopImageJson), (err) => {
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
