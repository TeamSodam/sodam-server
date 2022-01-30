const puppeteer = require('puppeteer');

const getImage = async (shopId) => {
  const browser = await puppeteer.launch(); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  //  일단 아이디 찾으면 아래 로직으로 파싱 가능
  await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723&filterType=%EC%97%85%EC%B2%B4%EC%82%AC%EC%A7%84`, {
    waitUntil: 'networkidle0',
  });

  await page.waitForSelector('._3TiO6', { visible: true });
  const imageResponse = await page.evaluate(() => document.querySelector('._3TiO6').outerHTML);
  console.log('>>>>>>>>>>>>>>>>>>>imageResponse', imageResponse);
};

const ExecuteCrawling = async (keyword) => {
  // 임시로 브라우저 작동 과정 봄
  const browser = await puppeteer.launch(); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  await page.goto(`https://map.naver.com/v5/search/${keyword}?c=14137173.7122868,4521234.4977928,15,0,0,0,dh`, { waitUntil: 'networkidle0' });

  const frameUrl = await page.frames()[0]._url;
  const splitUrl = frameUrl.split('/');
  const paramAndQuery = splitUrl[splitUrl.length - 1].split('?');
  const shopId = paramAndQuery[0];

  const imageArray = getImage(shopId);

  //   await page.waitForSelector('._ngcontent-ucw-c135', { visible: true });
  //   const response = await page.evaluate(() => document.querySelector('._1Y6hi').outerHTML);
  //   console.log('>>>>>>>>>>>>>>>>>>>response', response);

  //   console.log(a);
  //   const url = await page.url();
  //   const chain = response.request().redirectChain();
  //   console.log('>>>>>>chain.length', chain.length);
  //   console.log('*************chain[0].url()', chain);
  //   console.log('))))))url', url);
  //   const a = await page.goto(`https://map.naver.com/v5/search/${keyword}?c=14137173.7122868,4521234.4977928,15,0,0,0,dh`, { waitUntil: 'domcontentloaded', timeout: 0 });
  //   const result = await response.text();
  //   console.log(result);

  // 키워드 입력
  //   await page.type('input.input_search', keyword);
  // 키워드 검색
  //   await page.type('input.input_search', String.fromCharCode(13));

  //   await page.waitForNavigation();

  //story1
  //   await page.click('._1Az1K > ul > li:nth-child(1)');

  //story2
  //     await page.waitForSelector(`div._2MDmw`);
  //     await page.click(`div._2MDmw:nth-child(4)`);
  //   await page.click('div.place_detail_wrapper > div.place_fixed_maintab > div._1XNy0 > div.XirMe > div > div._2MDmw:nth-child(4)');

  //페이지 로딩 후 evaluate() 함수는 javascript 코드를 DOM 컨텍스트에서 실행 가능하게 하고 변수 전달도 가능하다
  //   const allData = await page.evaluate(() => {
  //     // const scrappedData = [];
  //     const placeChilds = document.querySelector('.place_didmount');
  //     console.log('&&&&placeChilds', placeChilds);
  //     return placeChilds;
  //   });
  //   console.log('allData!>>>>', allData);
  // 모든 스크래핑 작업을 마치고 브라우저 닫기
  //   await browser.close();
};

ExecuteCrawling('원모어백');
