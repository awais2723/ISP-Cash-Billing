const bcrypt = require('bcryptjs');

const password = 'admin'; // The password you want to use
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('--- Copy this hashed password ---');
console.log(hash);