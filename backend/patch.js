const fs = require('fs');
const files = ['./controllers/spotifyController.js', './controllers/meController.js'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const data = await response\.json\(\);/g, `
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Spotify API returned non-JSON:', await response.text().catch(()=>''));
      return res.json([]);
    }
  `);
  fs.writeFileSync(file, content);
});
