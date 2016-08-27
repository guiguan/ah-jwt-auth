/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2016-08-27T21:14:26+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2016-08-27T21:22:41+10:00
 */



exports.default = {
  jwtauth: function(api){
    return {
      enabled: {
        web: true,
        websocket: true,
        socket: false,
        testServer: false
      },
      secret: api.config.general.serverToken + 'Change Me!',
      algorithm: 'HS512',
      enableGet: false // enables token as GET parameters in addition to Authorization headers
    }
  }
}

exports.test = {
  jwtauth: function(api){
    return {
      enabled: {
        web: false,
        websocket: false,
        socket: false,
        testServer: false
      },
      secret: api.config.general.serverToken + 'Change Me!',
      algorithm: 'HS512',
      enableGet: false // enables token as GET parameters in addition to Authorization headers
    }
  }
}

exports.production = {
  jwtauth: function(api){
    return {
      enabled: {
        web: true,
        websocket: true,
        socket: false,
        testServer: false
      },
      secret: api.config.general.serverToken + 'Change Me!',
      algorithm: 'HS512',
      enableGet: false // enables token as GET parameters in addition to Authorization headers
    }
  }
}
