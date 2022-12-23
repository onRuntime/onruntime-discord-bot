const reduceString = (str: string, length: number) => {
  if (str.length > length) {
    return str.substring(0, length - 3) + "...";
  }
  return str;
};

export default reduceString;
