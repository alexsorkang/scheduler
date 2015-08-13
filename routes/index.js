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
        var assetid = req.body.id;
        var date = req.body.date;
        var time = req.body.time;
        var duration = req.body.duration;
        console.log(assetid, date, time, duration, dlim)
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
            console.log(eventlst)
          }
        });
      });


      // app.post('/addevent', function(req, res){
      //     // var accessToken = req.session.access_token;
      //     var startdate, enddate, name, user;
      //     var route = req.body.route;
      //     if (req.body.type == '0') {
      //       var protonum;
      //       if (req.body.protonum == 'custom') {
      //         protonum = req.body.customrange;
      //       } else {
      //         protonum = protocols[req.body.protonum].properties.duration - 1;
      //       }
      //       user = req.body.name;
      //       startdate = moment().startOf('hour').add(req.body.date, 'days').add(req.body.time, 'hours').format();
      //       enddate = moment().startOf('hour').add(req.body.date, 'days').add(parseInt(req.body.time) + parseInt(protonum), 'hours').format();
      //       // console.log(startdate, enddate)
      //     } else {
      //       startdate = req.body.startdate;
      //       enddate = req.body.enddate;
      //       startdate = iSODateString(new Date(startdate));
      //       enddate = iSODateString(new Date(enddate));
      //       user = req.body.user;
      //       // console.log(startdate, enddate)
      //     }
      //     name = req.body.id;
      //     //get the list of scheduled events
      //     gcal.events.list(
      //       {
      //       auth: oauth2Client,
      //       calendarId: calendarId,
      //       timeMin: today + '00:00:00.000Z',
      //       timeMax: nextweek + '23:59:59.000Z'},
      //       function(err, events) {
      //       if(err) {
      //         return res.send(500, err);
      //       } else {
      //         //start here
      //           var eventlst = {};
      //           for (var anevent in events.items) {
      //             eventlst[anevent] = {asset: events.items[anevent].summary,
      //                         eventId: events.items[anevent].description,
      //                         start: events.items[anevent].start.dateTime,
      //                         end: events.items[anevent].end.dateTime,
      //                         id: events.items[anevent].id};
      //                       }
      //           var exists = false,
      //             bookable,
      //             assetname;
      //             for (var assets in dlim) {
      //               if (dlim[assets].id === name) {
      //                 assetname = dlim[assets].properties.name;
      //                 exists = true;
      //                 bookable = JSON.parse(dlim[assets].properties.bookable);
      //               }
      //             }
      //           //checking current calendar if there are any overlaps
      //           if (exists && bookable) {
      //             var overlaps = false;
      //             for (anevent in eventlst) {
      //               if (eventlst[anevent].eventId === name) {
      //                   var eventstart = eventlst[anevent].start,
      //                   eventend = eventlst[anevent].end;
      //                 var interval2 = startdate + '/' + enddate;
      //                 var interval1 = moment.range(eventstart, eventend);
      //                   interval2 = moment.range(interval2);
      //                   // console.log(interval1,interval2)
      //                 if ((interval2.overlaps(interval1))) {
      //                   overlaps = true;
      //                 }
      //               }
      //             }
      //           if (!overlaps) {
      //             // now add since its valid timeslot and name
      //               var event = {
      //                     summary: assetname,
      //                     description: name,
      //                     end: {dateTime: enddate},
      //                     start: {dateTime: startdate},
      //                     location: user
      //                     };
      //               gcal.events.insert({auth: oauth2Client,
      //                                   calendarId: calendarId,
      //                                   resource: event},
      //                 function(err2) {
      //                   if (err2) {
      //                     return res.status(500).send(err2);
      //                   } else {
      //                     console.log('added an event')
      //                     // return res.redirect('/home');
      //                     if (req.body.type == '0') {
      //                       return res.redirect('/' + route);
      //                     } else {
      //                       return res.end();
      //                     }
      //                   }
      //                 });
      //             } else {
      //               return res.send(500, {error: 'Not available at that time'});
      //             }
      //           } else {
      //             return res.send(500, {error: 'Not a valid asset or unbookable'});
      //           }
      //         }
      //     });
      //   });


    }
  })
}