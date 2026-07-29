const fs = require('fs');
const data = JSON.parse(fs.readFileSync('fallback_data.json', 'utf8'));
const topHits = data.find(d => d.query === 'top hits');
topHits.results = [
  {
    "id": "MJyKN-8UncM",
    "uri": "MJyKN-8UncM",
    "title": "Shayad - Love Aaj Kal",
    "artist": "Sony Music India",
    "image": "https://i.ytimg.com/vi/MJyKN-8UncM/hq720.jpg",
    "duration": 190,
    "youtubeId": "MJyKN-8UncM"
  },
  {
    "id": "RLzC55ai0eo",
    "uri": "RLzC55ai0eo",
    "title": "Heeriye",
    "artist": "Jasleen Royal",
    "image": "https://i.ytimg.com/vi/RLzC55ai0eo/hq720.jpg",
    "duration": 199,
    "youtubeId": "RLzC55ai0eo"
  },
  {
    "id": "vEe-UgJvUHE",
    "uri": "vEe-UgJvUHE",
    "title": "Arijit Singh - Raabta",
    "artist": "PluginVibes",
    "image": "https://i.ytimg.com/vi/vEe-UgJvUHE/hq720.jpg",
    "duration": 234,
    "youtubeId": "vEe-UgJvUHE"
  },
  {
    "id": "5-OqPhet-NU",
    "uri": "5-OqPhet-NU",
    "title": "Dil Sambhal Ja Zara",
    "artist": "Jibonpathik",
    "image": "https://i.ytimg.com/vi/5-OqPhet-NU/hq720.jpg",
    "duration": 334,
    "youtubeId": "5-OqPhet-NU"
  }
];
fs.writeFileSync('fallback_data.json', JSON.stringify(data, null, 2));
