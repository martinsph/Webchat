const connection = require('../connection');

const createMessage = async (message) => {
  (await connection()).collection('messages').insertOne(message);
}; 

const listMessage = async () => {
  await (await connection()).collection('messages').find().toarray();
}; 

module.exports = { 
  createMessage,
  listMessage,
};
