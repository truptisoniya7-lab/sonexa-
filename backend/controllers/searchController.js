const SearchService = require('../services/SearchService');

const search = async (req, res) => {
  try {
    const q = req.query.q;
    const results = await SearchService.performSearch(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  search
};
