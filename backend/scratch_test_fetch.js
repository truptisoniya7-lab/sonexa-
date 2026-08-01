const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:5000/music/search?q=test');
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 200));
  } catch(e) {
    console.error(e);
  }
}
test();
