class ERC20 {
  contract;

  name;
  symbol;
  owner;
  decimals;
  constructor(_contract) {
    this.contract = _contract;
  }

  async getName() {
    try {
      if (this.name && this.name != '') return Promise.resolve(name);

      const name = await this.contract.methods.name().call();
      this.name = name;

      return Promise.resolve(name);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getSymbol() {
    try {
      if (this.symbol && this.symbol != '') return Promise.resolve(symbol);

      const symbol = await this.contract.methods.symbol().call();

      this.symbol = symbol;
      return Promise.resolve(symbol);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getDecimals() {
    try {
      if (this.decimals && this.decimals != '') return Promise.resolve(decimals);

      const decimals = await this.contract.methods.decimals().call();

      this.decimals = decimals;
      return Promise.resolve(decimals);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getOwner() {
    try {
      if (this.owner && this.owner != '') return Promise.resolve(owner);

      const owner = await this.contract.methods.owner().call();
      this.owner = owner;

      return Promise.resolve(owner);
    } catch (err) {
      try {
        const owner = await this.contract.methods.getOwner().call();
        this.owner = owner;

        return Promise.resolve(owner);
      } catch (err) {
        return Promise.resolve(false);
      }
    }
  }
}

module.exports = ERC20;
