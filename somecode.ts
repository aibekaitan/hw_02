const sqr = (num: number) => {
  console.log('call');
  return num * num;
};
//ispol'zovat' cash kak to

function memo(fn: (n: number) => number) {
  const map = new Map<number, number>();
  return (num: number) => {
    if (map.has(num)) {
      return map.get(num);
    }
    map.set(num, fn(num));
    // console.log('call ' + fn(num));
    return map.get(num);
  };
}

const memSqr = memo(sqr);
console.log(memSqr(5));
console.log(memSqr(5));
console.log(memSqr(7));
console.log(memSqr(5));
console.log(memSqr(7));
