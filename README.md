<!--
@Author: Guan Gui <guiguan>
@Date:   2016-08-27T21:14:26+10:00
@Email:  root@guiguan.net
@Last modified by:   guiguan
@Last modified time: 2016-08-30T16:39:51+10:00
-->



# ah-jwt-auth

JWT Authentication Middleware for ActionHero. Based on [ifavo/ah-jwtauth2-plugin](https://github.com/ifavo/ah-jwtauth-plugin) and original [lookaflyingdonkey/ah-jwtauth-plugin](https://github.com/lookaflyingdonkey/ah-jwtauth-plugin).

## Installation & Setup
* `npm install -S ah-jwt-auth`
- Run `actionhero link --name=ah-jwt-auth` to register the Swagger Plugin in ActionHero 15+. [More details](http://www.actionherojs.com/docs/#including-plugins).
- Make changes in `config/jwtAuth.js` accordingly

## Usage
This plugin will check your action templates for a property called `authenticate`, if it exists and is true it will then require that a "Authorization" header has been sent with the request holding a valid JSON Web Token. I make use of the node-jsonwebtoken module (https://github.com/auth0/node-jsonwebtoken) to generate and validate the tokens.  
The value of the header must start with `Token ` to be picked up.

An example header would be:

    Authorization: Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6MTIzNCwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNDQ1Mjc2NDYyfQ.vB5yV2PGOj1oVIsqDDU7uWlkrf--a1TX2EtsqSDkjqyCGzho1rYO-AQgsDxsKcf5rocmeAx_4Jq4A3wHff2euQ

Test it with curl:

    curl http://localhost:8080/yourAction --header "Authorization: Token eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6MTIzNCwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNDQ1Mjc2NDYyfQ.vB5yV2PGOj1oVIsqDDU7uWlkrf--a1TX2EtsqSDkjqyCGzho1rYO-AQgsDxsKcf5rocmeAx_4Jq4A3wHff2euQ"

Token data sent via `Authorization` Headers will be provided in your action within `data.connection._jwtTokenData`:

    […]
    run: function(api, data, next) {
        data.response.tokenData = data.connection._jwtTokenData;
    […]


Tests can be done with mockHeaders when running actions:

    […]
    var connection = new api.specHelper.connection();
    connection.mockHeaders = {
        authorization: "Token " + token
    };
    connection.params = {};

    api.specHelper.runAction('<ACTION>', connection, function(response) {
    […]

### Settings
* You can select the algorithm you want to use with the options available at https://github.com/auth0/node-jsonwebtoken
* You will need to set a secret that will be used to create the token

### Generate a token
You need to generate a token once a user has successfully authenticated against your API, this could be by signing in with a username/password or you could simply generate them through a CMS, print them out and post them to your users ;-)

    api.jwtauth.generateToken({id: 1234, email: 'test@example.com'}, function(token) {

      // token will hold the generated token
      data.response.token = token;
      next();

    }, function(err) {

      // An error occured generating a token
      data.error = err;
      next();

    });

You can also add options like expiry time:

    // token expires in 60s
    api.jwtauth.generateToken({id: 1234, email: 'test@example.com'}, {expiresIn: "60s"}, function(token) {

      // token will hold the generated token
      data.response.token = token;
      next();

    }, function(err) {

      // An error occured generating a token
      data.error = err;
      next();

    });

Options are:

* `expiresIn`: expressed in seconds or an string describing a time span [rauchg/ms](https://github.com/rauchg/ms.js). Eg: `60`, `"2 days"`, `"10h"`, `"7d"`
* `audience`
* `subject`
* `issuer`
* `noTimestamp`
* `headers`


I would suggest not storing a huge amount of information in them as it will just mean more data transferred per request, but you can put some identifying info like email, name, etc. The beauty of this is that you don't need to hit the database every time to authenticate a user.

### Validate a token
While the plugin will automatically validate a token and put it on the connection object for you as connection.user, you can also validate the tokens yourself like below.

    api.jwtauth.processToken("abce1234==", function(data) {

      // Valid data, lets set it and continue
      console.log(data);

    }, function(err) {

      console.log('Error', err);

    });
