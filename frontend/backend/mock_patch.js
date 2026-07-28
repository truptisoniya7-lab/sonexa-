const fs = require('fs');

const mockDataStr = `
const MOCK_TRACKS = [
  { id: '1', uri: 'spotify:track:1', title: 'Mock Song 1', artist: 'Mock Artist A', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80', duration: 180, progress: 40, lastListened: '2 hours ago' },
  { id: '2', uri: 'spotify:track:2', title: 'Mock Song 2', artist: 'Mock Artist B', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80', duration: 200, progress: 10, lastListened: 'Yesterday' },
  { id: '3', uri: 'spotify:track:3', title: 'Mock Song 3', artist: 'Mock Artist C', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80', duration: 240, progress: 90, lastListened: '2 days ago' },
  { id: '4', uri: 'spotify:track:4', title: 'Mock Song 4', artist: 'Mock Artist D', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80', duration: 190, progress: 0, lastListened: '3 days ago' },
  { id: '5', uri: 'spotify:track:5', title: 'Mock Song 5', artist: 'Mock Artist E', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', duration: 210, progress: 0, lastListened: '1 week ago' },
];
`;

const processFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('MOCK_TRACKS')) {
    content = content.replace("const fetch = require('node-fetch');", "const fetch = require('node-fetch');\n" + mockDataStr);
  }
  
  content = content.replace(/return res\.json\(\[\]\);/g, "return res.json(MOCK_TRACKS);");
  fs.writeFileSync(file, content);
};

processFile('./controllers/spotifyController.js');
processFile('./controllers/meController.js');
