const connection = require('../connection');

const createMessage = async (message) => {
  const db = await connection();
  const result = await db.collection('messages').insertOne(message);
  return result;
}; 

const listMessage = async () => {
  const db = await connection();
  const result = await db.collection('messages').find().toArray();
  return result;
}; 

module.exports = { 
  createMessage,
  listMessage,
};
