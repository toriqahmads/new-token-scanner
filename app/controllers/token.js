const tokenRepository = require('../repositories/token');

const findAll = async(req, res, next) => {
  try {
    const filter = { ...req.query };
    const network = req.params.network;
    const tokens = await tokenRepository.findAll(network, filter);

    return res.status(200).json({
      status: true,
      data: tokens
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  findAll
};
