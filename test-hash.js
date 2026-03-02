const bcrypt = require('bcryptjs');

const password = '35490';
const hash = bcrypt.hashSync(password, 10);

console.log('=========================================');
console.log('NEW HASH FOR YOUR DATABASE:');
console.log(hash);
console.log('=========================================');
console.log('Test verification:', bcrypt.compareSync(password, hash));