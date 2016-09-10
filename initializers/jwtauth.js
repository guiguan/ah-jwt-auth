/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-08-27T21:14:26+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-09-10T12:10:14+10:00
 */



var jsonwebtoken = require('jsonwebtoken');

module.exports = {
  loadPriority: 1000,
  startPriority: 1000,
  stopPriority: 1000,

  initialize: function(api, next) {
    api.jwtauth = {
      processToken: function(token, success, fail) {

        jsonwebtoken.verify(token, api.config.jwtauth.secret, {}, function(err, data) {
          err ? fail(err) : success(data);
        });

      },
      generateToken: function(data, options, success, fail) {

        // identify parameter format
        if (typeof(options) == 'function') {
          fail = success;
          success = options;
          options = {};
        } else {
          options = options ||  {};
        }
        if (!options.algorithm) {
          options.algorithm = api.config.jwtauth.algorithm;
        }

        try {
          var token = jsonwebtoken.sign(data, api.config.jwtauth.secret, options);
          if (success) {
            success(token);
          }
        } catch (err) {
          if (fail) {
            fail(err);
          }
        }
      }
    };

    var jwtMiddleware = {
      name: 'ah-jwt-auth',
      global: true,
      preProcessor: function(data, next) {

        // is it required to have a valid token to access an action?
        var tokenRequired = false;
        if (data.actionTemplate.authenticate && api.config.jwtauth.enabled[data.connection.type]) {
          tokenRequired = true;
        }

        // get request data from the required sources
        var token = '';
        var req = {
          headers: data.params.httpHeaders || (data.connection.rawConnection.req ? data.connection.rawConnection.req.headers : undefined) || data.connection.mockHeaders || {},
          uri: data.connection.rawConnection.req ? data.connection.rawConnection.req.uri : {}
        };

        var authHeader = req.headers.authorization ||  req.headers.Authorization ||  false;

        // extract token from http headers
        if (authHeader) {
          var parts = authHeader.split(' ');
          if (parts.length != 2 || parts[0].toLowerCase() !== 'token') {

            // return error if token was required and missing
            if (tokenRequired) {
              return next({
                code: 500,
                message: 'Invalid Authorization Header'
              });
            } else {
              return next();
            }

          }
          token = parts[1];
        }

        // if action param for tokens is allowed, use it
        if (!token && api.config.jwtauth.enableParam && data.params.token) {
          token = data.params.token;
        }

        // return error if token was missing but marked as required
        if (tokenRequired && !token) {
          return next({
            code: 500,
            message: 'Authorization Header Not Set'
          });
        }

        // process token and save in connection
        else if (token) {
          api.jwtauth.processToken(token, function(claims) {
            data.connection.jwt = {
              token,
              claims
            };
            next();
          }, next);
        } else {
          return next();
        }

      },

      stop: function(api, next) {
        next();
      }
    }

    api.actions.addMiddleware(jwtMiddleware);

    next();
  },
  start: function(api, next) {
    next();
  },
  stop: function(api, next) {
    next();
  }
}
