const promise = Promise.resolve(1);
const promise2 = Promise.resolve(1);

async function first() {
  await promise
    .then((r) => console.log('first then 1', r))
    .then((r) => console.log('first then 2', r))
    .then((r) => console.log('first then 3', r))
    .then((r) => console.log('first then 4', r))
    .then((r) => console.log('first then 5', r));
  console.log('after first await');
}

async function second() {
  await promise2
    .then((r) => console.log('second then 1', r))
    .then((r) => console.log('second then 2', r));
  console.log('after second await');
  await promise2
    .then((r) => console.log('second then 1', r))
    .then((r) => console.log('second then 2', r));
}

first();
second();
