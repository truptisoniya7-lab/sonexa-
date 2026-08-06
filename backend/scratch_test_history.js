const fetch = require('node-fetch');

async function test() {
  console.log("Testing POST /history/sync (short play - should be ignored)");
  const res1 = await fetch('http://localhost:5000/history/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: '1',
      song_id: 'test-song-1',
      song_title: 'Test Song 1',
      song_artist: 'Test Artist',
      song_image: 'https://via.placeholder.com/150',
      duration: 300,
      progress: 0.03, // 3%
      last_position: 10, // 10 seconds
      completed: false
    })
  });
  console.log("Res1:", await res1.json());

  console.log("Testing POST /history/sync (long play - should be inserted)");
  const res2 = await fetch('http://localhost:5000/history/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: '1',
      song_id: 'test-song-1',
      song_title: 'Test Song 1',
      song_artist: 'Test Artist',
      song_image: 'https://via.placeholder.com/150',
      duration: 300,
      progress: 0.20,
      last_position: 60,
      completed: false
    })
  });
  console.log("Res2:", await res2.json());

  console.log("Testing GET /history/recent/1");
  const res3 = await fetch('http://localhost:5000/history/recent/1');
  const json3 = await res3.json();
  console.log("Res3:", json3.grouped ? "Grouped Object Returned" : "Failed");

  console.log("Testing GET /history/recent/1?filter=continue");
  const res4 = await fetch('http://localhost:5000/history/recent/1?filter=continue');
  const json4 = await res4.json();
  console.log("Res4:", Array.isArray(json4) ? `Array returned: ${json4.length} items` : "Failed");
}

test();
