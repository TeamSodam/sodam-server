// arr[key]값이 string인 경우 number로 바꿔주는 함수
const convertStringToNum = (arr, key) => {
  let result = arr;
  arr.map((item, idx) => {
    result[idx] = { ...result[idx], [key]: Number(item[key]) };
  });
  return result;
};
module.exports = { convertStringToNum };
