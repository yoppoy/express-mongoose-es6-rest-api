function objToString(obj) {
  let str = '';

  Object.keys(obj)
    .forEach((key) => {
      str += key + ':' + obj[key] + '\n';
    });
  return str;
}

module.exports = { objToString };
