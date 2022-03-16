const express = require('express');
const router = express.Router();
const validate = require('../app/middlewares/validation');
const validationRules = require('../app/validations/token');

const controller = require('../app/controllers/token');

router.get('/:network', validationRules.findAll(), validate, controller.findAll);

module.exports = router;
