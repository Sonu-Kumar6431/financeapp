const TOTAL = 500;
const CONCURRENCY = 20;

let next = 0;

async function worker() {
  while (true) {
    const i = next++;

    if (i >= TOTAL) return;

    try {
      const res = await fetch('http://localhost:5000/api/');

      console.log(i, res.status);
    } catch (err) {
      console.log(i, 'network error:', err.message);
    }
  }
}

Promise.all(
  Array.from({ length: CONCURRENCY }, worker)
).then(() => {
  console.log('Finished');
});