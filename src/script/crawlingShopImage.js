const puppeteer = require('puppeteer');

const ExecuteCrawling = async (keyword) => {
  // 임시로 브라우저 작동 과정 봄
  const browser = await puppeteer.launch({ headless: false }); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.goto('https://map.naver.com/v5/?c=14137173.7122868,4521234.4977928,15,0,0,0,dh');

  // 키워드 입력
  await page.type('input.input_search', keyword);
  // 키워드 검색
  await page.type('input.input_search', String.fromCharCode(13));

  //   await page.waitForNavigation();
  await page.waitForSelector('div._2MDmw');
  //story2
  await page.click('div._2MDmw:nth-child(4)');
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
  await browser.close();
};

ExecuteCrawling('원 모어백');
