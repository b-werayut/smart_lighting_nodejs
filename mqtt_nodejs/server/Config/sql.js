const sql = require('mssql')

const config = {
  user: 'nwlproduction',
  password: 'Nwl!2563789!',
  server: '85.204.247.82,26433',
  database: 'AdAM01',
  pool: {
    max: 10,   
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ SQL Server connected')
    return pool
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message)
    console.error(err)
  })

module.exports = { sql, poolPromise }
