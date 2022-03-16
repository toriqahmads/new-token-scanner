const database = require('../database');
const {
  collection, query, where, limit, addDoc, getDocs, orderBy, startAfter
} = require('firebase/firestore');

const dateDiffInDays = (start_date, end_date) => Math.round((end_date - start_date) / (1000 * 60 * 60 * 24));

const save = async(data) => {
  try {
    const Token = collection(database, 'tokens');
    const token = await addDoc(Token, data);

    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
}

const findAll = async(network, filter) => {
  try {
    const start_date = new Date(filter.start_date).setHours(0, 0, 0);
    const end_date = new Date(filter.end_date).setHours(23, 59, 59);
    console.log(dateDiffInDays(start_date, end_date))
    if (dateDiffInDays(start_date, end_date) > 3) {
      const error = new Error(`2 days maximum for retrieving data`);
      error.status = 400;
      throw error;
    }

    const pagination = [limit(25)];
    if (filter.last_visible && filter.last_visible !== '') {
      const TokenRef = collection(database, 'tokens');
      const findFirst = await getDocs(query(TokenRef, where('address', '==', filter.last_visible)));
      if (findFirst.docs.length > 0) {
        pagination.push(startAfter(findFirst.docs[0]));
      }
    }
    if (filter.limit && filter.limit > 0) {
      pagination[0] = limit(parseInt(filter.limit));
    }

    const TokenRef = collection(database, 'tokens');
    const queries = query(
      TokenRef,
      where('network_short', '==', network.toUpperCase()),
      where('created_at', '>=', start_date),
      where('created_at', '<=', end_date),
      orderBy('created_at', 'desc'),
      ...pagination
    );

    const Tokens = await getDocs(queries);
    const tokens = [];
    Tokens.forEach((token) => {
      tokens.push({ id: token.id, ...token.data() });
    });

    const last_visible = Tokens.docs.length > 0 ? Tokens.docs[Tokens.docs.length - 1].get('address') : null;
    return Promise.resolve({
      tokens,
      last_visible
    });
  } catch (err) {
    console.log('err', err)
    return Promise.reject(err);
  }
}

module.exports = {
  save,
  findAll
};
