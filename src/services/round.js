export default function round(n, what) {
  var i = 0;
  if (n < 1) {
    while (n < 1) {
      n = n * 10;
      i++;
    }
  }
  return '0.' + (new Array(i)).join('0') + n.toFixed(what).replace('.', '').slice(0, -1);
}