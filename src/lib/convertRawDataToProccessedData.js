// absorptionId를 제외하고 다른 필드의 값이 공통될 때, absorptionId 값을 배열로 묶어주는 함수
const duplicatedDataClean = (arr, key, absorptionId) => {
  let keyPerAbsorptionItem = {};
  let isDuplicated = {};
  const result = [];
  // 모든 key별 absorptionId를 모아서 배열로 만들기
  arr.map((item) => {
    if (!keyPerAbsorptionItem[item[key]]) {
      keyPerAbsorptionItem[item[key]] = [];
    }
    keyPerAbsorptionItem[item[key]].push(item[absorptionId]);
  });
  // 중복없는 리스트 만들기 (absorptionId를 빼고 복사해도 될듯)
  arr.map((item) => {
    if (!isDuplicated[item[key]]) {
      isDuplicated[item[key]] = true;
      item[absorptionId] = keyPerAbsorptionItem[item[key]];
      result.push(item);
    }
  });
  return result;
};
module.exports = { duplicatedDataClean };
