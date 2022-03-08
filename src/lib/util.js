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
  checkIsNum: (string) => {
    if (isNaN(string) === true) {
      return false;
    } else {
      return true;
    }
  },
  checkIsInRange: (page) => {
    if (Number(page) < 0 || !Number.isInteger(Number(page)) || isNaN(page) === true){
      return false;
    } else {
      return true;
    }
  }
};
