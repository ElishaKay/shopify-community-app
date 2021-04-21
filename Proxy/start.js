// start.js
const mongoose = require('mongoose');
const throng = require('throng');
require('dotenv').config({ path: '.env' });

const Raven = require("raven");
Raven.config("https://857ac98ea79e4f7ba26c306a706e8480@o575752.ingest.sentry.io/5728460").install();

mongoose
  .connect(process.env.DATABASE_LOCAL, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true})
  .then(()=> console.log('DB Connected'))
  .catch(err=>{
    console.log(err);
  })

mongoose.Promise = require('bluebird');

mongoose.connection.on('error', (err) => {
  console.error(`🚫 Database Error 🚫  → ${err}`);
});

function start() {
  /* You should require your models here so you don't have to initialise them all the time in
  different controlers*/
  require('./models/Shop');

  const app = require('./app');
  app.set('port', process.env.PORT || 7777);
  const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);

    // if(process.NODE_ENV!='development'){
    //     process.on('uncaughtException', function(err) {
    //     console.log('Caught exception: ' + err);
    //   });
    // }
  });
}


throng({
  workers: process.env.WEB_CONCURRENCY || 1,
}, start);
