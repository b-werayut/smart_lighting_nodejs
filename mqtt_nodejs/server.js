// const express = require('express')
// const app = express()
// const morgan = require('morgan')
// const cors = require('cors')
// const { readdirSync } = require('fs')

// app.use(cors())
// app.use(morgan('dev'))
// app.use(express.json())

// readdirSync("./Routes")
// .map((c)=> app.use('/api', require(`./Routes/${c}`)))

// app.listen(3002, ()=> {console.log('✅ Server run on port 3002')})

const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { readdirSync } = require('fs');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

readdirSync("./Routes").map((file) => {
  app.use('/api', require(`./Routes/${file}`));
});

// const privateKey = fs.readFileSync('./ssl/key.pem', 'utf8');
// const certificate = fs.readFileSync('./ssl/cert.pem', 'utf8');
// const credentials = { key: fs.readFileSync('./ssl/server.key'), cert: fs.readFileSync('./ssl/server.cert') };
const credentials = { key: fs.readFileSync('./ssl/key.pem'), cert: fs.readFileSync('./ssl/cert.pem') };



https.createServer(credentials, app).listen(3002, () => {
  console.log('✅ HTTPS API server running on port 3002');
});

