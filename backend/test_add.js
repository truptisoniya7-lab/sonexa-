const axios = require('axios');

async function testAdd() {
  try {
    const res = await axios.post('http://localhost:5000/rooms/1/queue', {
      song_uri: 'test_uri',
      song_title: 'test_title',
      song_artist: 'test_artist',
      song_image: 'test_image',
      added_by: 1
    });
    console.log(res.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
}

testAdd();
