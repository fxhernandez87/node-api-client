// Dependencies
const dataService = require('./services/data');

//User Service
const userService = dataService('users');
const tokenService = dataService('tokens');

userService.list().then(res => {
  console.log('res: ', res);
}).catch(err => {
  console.log('error occurred: ', err.code, err.message);
});
