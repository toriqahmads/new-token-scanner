const { query, param } = require('express-validator');
const date = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

const findAll = () => {
  return [
    param('network')
      .exists()
      .notEmpty()
      .isString()
      .escape()
      .isIn([
        'bsc',
        'ftm',
        'eth',
        'matic'
      ])
      .withMessage('please input a valid network'),
    query('start_date')
      .exists()
      .notEmpty()
      .isString()
      .escape()
      .matches(date)
      .withMessage('please input a valid date with YYYY-MM-DD format'),
    query('end_date')
      .exists()
      .notEmpty()
      .isString()
      .escape()
      .matches(date)
      .withMessage('please input a valid date with YYYY-MM-DD format'),
    query('last_visible')
      .optional()
      .notEmpty()
      .isString()
      .escape()
      .withMessage('please input a valid last visible id'),
    query('limit')
      .optional()
      .notEmpty()
      .isInt({
        min: 1,
        max: 200
      })
      .withMessage('please input a valid limit'),
  ]
}

module.exports = {
  findAll
};
