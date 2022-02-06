module.exports = {
  success: (status, message, data) => {
    return {
      status,
      success: true,
      message,
      data,
    };
  },
  fail: (status, message) => {
    return {
      status,
      success: false,
      message,
    };
  },
  // req값이 숫자이면 true를 리턴, 문자이면 false를 리턴
  checkIsNum: (string) => {
    const convertNum = Number(string);
    if (isNaN(convertNum) === true) {
      return false;
    } else {
      return true;
    }
  },
};
