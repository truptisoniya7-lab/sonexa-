const { pool } = require('./config/db');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
  .then(res => console.log(res.rows))
  .catch(err => console.error(err))
  .finally(() => pool.end());
