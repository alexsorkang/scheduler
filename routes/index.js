var googleapis = require('googleapis');
var gcal = googleapis.calendar('v3');
var moment = require('moment');
  require('moment-range');
var today = moment().format('YYYY-MM-DD') + 'T';
var nextweek = moment().add(14, 'days').format('YYYY-MM-DD') + 'T';
var dlim = require('../dlim.json');
dlim = dlim.data;
module.exports = function(app, passport) {
  var calendarId = 'asork42@berkeley.edu';
  var SERVICE_ACCOUNT_EMAIL = '11919937873-oa50l7m4t920h26ii46v47ok3albdraa@developer.gserviceaccount.com';
  var SERVICE_ACCOUNT_KEY_FILE = __dirname + '/key.pem';
  var oauth2Client = new googleapis.auth.JWT(
    SERVICE_ACCOUNT_EMAIL,
    SERVICE_ACCOUNT_KEY_FILE,
    null,
    ['https://www.googleapis.com/auth/calendar']
  );

  oauth2Client.authorize(function(err, tokens) {
    if (err) {
      console.log(err)
      return
    } else {

      // this lists all assets and scheduled assets
      app.get('/', function(req, res) {
        gcal.events.list(
          {
          auth: oauth2Client,
          calendarId: calendarId,
          timeMin: today + '00:00:00.000Z',
          timeMax: nextweek + '23:59:59.000Z'},
          function(err, events) {
          if(err) {
            return res.send(500, err);
          } else {
            var eventlst = {};
            for (var anevent in events.items) {
            eventlst[anevent] = {assetname: events.items[anevent].summary,
                        AssetID: events.items[anevent].description,
                        start: events.items[anevent].start.dateTime,
                        end: events.items[anevent].end.dateTime,
                        eventid: events.items[anevent].id
                        };
                      }
            res.render('index', {assets: dlim, scheduledassets: eventlst});
          }
        });
      });
      app.post('/delevent', function(req, res) {
        var eventid = req.body.entry;
        gcal.events.delete(
          {
          auth:oauth2Client,
          calendarId: calendarId,
          eventId: eventid},
          function(err, events) {
            if (err) {
              return res.send(500, err);
            } else {
              return res.redirect('/');
            }
          }
        )
      });
      app.post('/addevent', function(req, res) {
        // gcal.events.insert
      });



    }
  })
}