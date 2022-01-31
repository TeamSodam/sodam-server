const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const getImage = async (shopId) => {
  const browser = await puppeteer.launch(); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  //  일단 아이디 찾으면 아래 로직으로 파싱 가능
  await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723&filterType=%EC%97%85%EC%B2%B4%EC%82%AC%EC%A7%84`, {
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('._3TiO6', { visible: true });
  const content = await page.content();
  const $ = cheerio.load(content);
  const $img = $('img');
  const imgSources = [];
  $img.each((_, elem) => {
    imgSources.push(elem.attribs.src);
  });

  return imgSources;
};

const getShopIdFromUrl = (url) => {
  const splitUrl = url.split('/');
  const paramAndQuery = splitUrl[splitUrl.length - 1].split('?');
  const shopId = paramAndQuery[0];
  return shopId;
};

const ExecuteCrawling = async (keyword) => {
  // 임시로 브라우저 작동 과정 보기 위해 headless 꺼둠
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  await page.goto(`https://map.naver.com/v5/search/${keyword}?c=14137173.7122868,4521234.4977928,15,0,0,0,dh`, { waitUntil: 'networkidle0' });

  //   console.log(page);
  const frameUrl = await page.frames()[0]._url;
  const shopId = getShopIdFromUrl(frameUrl);
  //   console.log('>>>>>>shopId', shopId);
  if (typeof shopId === 'number') {
    const imageArray = await getImage(shopId);
    // console.log('&&&&&&&&&&&&&&UimageArray', imageArray);
  } else {
    // 리스트 요소 중 첫번째를 클릭한 이후 shopId에 해당하는 돔 찾기
    const elementHandle = await page.$('#searchIframe');
    const searchResultFrame = await elementHandle.contentFrame();
    await searchResultFrame.click('a._3LMxZ:first-child');

    await page.waitForSelector('#entryIframe', { visible: true });

    const entryIframe = await page.$('#entryIframe');
    const shopInfoIframe = await entryIframe.contentFrame();
    const shopInfoIframeUrl = shopInfoIframe._frameManager._mainFrame._url;
    const newShopId = getShopIdFromUrl(shopInfoIframeUrl);
    // console.log('>>>>>>>>>newShopId', newShopId);
    const imageArray = await getImage(newShopId);
    // console.log('&&&&&&&&&&&&&&UimageArray', imageArray);
  }

  // 모든 스크래핑 작업을 마치고 브라우저 닫기
  await browser.close();
};

ExecuteCrawling('공작새');
