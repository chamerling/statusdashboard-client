/*!
 * statusdashboard-client: a node.js statusdashboard client
 * Copyright(c) 2012 Christophe Hamerling <christophe.hamerling@gmail.com>
 * MIT Licensed
 */

var io = require('socket.io-client'),
  colors = require('colors'),
  _ = require('underscore'),
  S = require('string'),
  util = require('util'),
  events = require('events');

var DashboardClient = exports.DashboardClient = function(url) {
  if (!url) {
    throw new Error('Dashboard URL is required.');
  }

  events.EventEmitter.call(this);
  var self = this;

  this.url = url;
};

util.inherits(DashboardClient, events.EventEmitter);

DashboardClient.prototype.connect = function() {

  info('Connecting to ' + this.url + '...');

  var socket = io.connect(this.url);

  socket.on('connect', function() {
    info('Connected!');
  });

  socket.on('disconnect', function() {
    warn('Socket has been disconnected');
  });

  socket.on('status', function(status) {
    console.log(colors.blue(colors.bold('[INFO] Status at ' + status.lastupdate)));
    console.log(colors.blue(colors.bold('[INFO] Summary - UP:' + status.summarize.up + ', CRITICAL:' + status.summarize.critical + ', DOWN:' + status.summarize.down + ', UNKNOWN:' + status.summarize.unknown)));

    _.each(status.services, function(service) {

      switch (service.status) {
      case 'up':
        console.log(colors.green(description(service)));
        break;

      case 'down':
        console.log(colors.magenta(description(service)));
        break;

      case 'unknown':
        console.log(colors.grey(description(service)));
        break;

      case 'critical':
        console.log(colors.red(description(service)));
        break;

      default:
        console.log(colors.bold(description(service)));
      }
    });
    console.log('');
  });

  socket.on('title', function(title) {
    info('Remote name ' + title);
  });

}

function description(service) {
  return ' * ' + colors.bold(S(service.status.toUpperCase())
    .padRight(10)
    .s) + " -> " + service.name + '(' + service.label + ') - status code: ' + service.statusCode + ", message: '" + service.message + "'";
}

function info(message) {
  console.log(colors.blue(S('[INFO]')
    .padRight(7)
    .s + message));
}

function warn(message) {
  console.log(colors.red(S('[WARN]')
    .padRight(7)
    .s + message));
}
