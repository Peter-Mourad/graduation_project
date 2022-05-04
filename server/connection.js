const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'grad',
    password: 'peter.data',
    port: 5432,
})

module.exports = pool