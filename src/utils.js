export var getId = (function() {
  var _nextId = 1;
  return function getId() {
    return _nextId++;
  };
})();

export function shuffle(array) {
  var index;
  var counter = array.length;

  while (counter > 0) {
    index = randInt(counter);
    counter--;
    [array[counter], array[index]] = [array[index], array[counter]];
  }

  return array;
}

export function randInt(a, b=0) {
  if (a > b) {
    [a, b] = [b, a];
  }
  return Math.floor(Math.random() * (b - a)) + a;
}

export function randItem(arr) {
  return arr[randInt(0, arr.length)];
}

export function randItemWeighted(arr, weightFunc) {
  var a;
  var total = 0;
  for (a of arr) {
    total += weightFunc(a);
  }
  var choice = Math.random() * total;
  for (a of arr) {
    choice -= weightFunc(a);
    if (choice < 0) {
      return a;
    }
  }
  throw new Error('No item picked. Probably a shitty weightFunc.')
}
