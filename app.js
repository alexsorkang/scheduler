/**
 * Module dependencies.
 */

'use strict';
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var bodyparser = require('body-parser'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  passport = require('passport');

var app = express();

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(session({ secret: 'whatisthis' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));

// app.get('/', routes.index);
// app.get('/users', user.list);
require('./routes/index')(app, passport);

var server = app.listen(process.env.PORT || 3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
