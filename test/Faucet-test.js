const { expect } = require('chai');

describe('Faucet', function () {
  let dev, ownerFroggies, alice, bob, charlie, Faucet, faucet, Froggies, froggies;
  const NAME = 'Froggies';
  const SYMBOL = 'FRG';
  const INITIAL_SUPPLY = ethers.utils.parseEther('1000000000');
  const TOKEN_SENT = ethers.utils.parseEther('100');
  const TIME_RESTRICTION = 259200;

  beforeEach(async function () {
    [dev, ownerFroggies, alice, bob, charlie] = await ethers.getSigners();

    Froggies = await ethers.getContractFactory('Froggies');
    froggies = await Froggies.connect(dev).deploy(ownerFroggies.address, INITIAL_SUPPLY, NAME, SYMBOL);
    await froggies.deployed();

    Faucet = await ethers.getContractFactory('Faucet');
    faucet = await Faucet.connect(dev).deploy(ownerFroggies.address, froggies.address);
    await faucet.deployed();

    await froggies.connect(ownerFroggies).approve(faucet.address, INITIAL_SUPPLY);
  });

  describe('Deployment', function () {
    it('Should be the owner address supplier of the Froggies contract', async function () {
      expect(await faucet.ownerSupplyAddress()).to.equal(ownerFroggies.address);
    });
    it('Should show the Froggies Address', async function () {
      expect(await faucet.tokenAddress()).to.equal(froggies.address);
    });
  });

  describe('getTokens', function () {
    it('Should change token balance when getTokens()', async function () {
      await expect(() => faucet.connect(charlie).getTokens()).to.changeTokenBalances(
        froggies,
        [ownerFroggies, charlie],
        [(-TOKEN_SENT).toString(), TOKEN_SENT.toString()]
      );
      await ethers.provider.send('evm_increaseTime', [TIME_RESTRICTION + 1]);
      await expect(() => faucet.connect(charlie).getTokens()).to.changeTokenBalances(
        froggies,
        [ownerFroggies, charlie],
        [(-TOKEN_SENT).toString(), TOKEN_SENT.toString()]
      );
    });

    it('Should revert getTokens if less than 3 days since the last time you have ask for tokens', async function () {
      await faucet.connect(alice).getTokens();
      await expect(faucet.connect(alice).getTokens()).to.be.revertedWith(
        'Faucet: You cannot get more tokens at the moment chill out'
      );
    });
    it('Should revert getTokens if not enough supply', async function () {
      await froggies.connect(ownerFroggies).transfer(bob.address, INITIAL_SUPPLY);
      await expect(faucet.connect(alice).getTokens()).to.be.revertedWith('Faucet: sorry not more tokens available');
    });
    it('Should emit when tokens are transfered', async function () {
      await expect(faucet.connect(bob).getTokens())
        .to.emit(faucet, 'Transfer')
        .withArgs(ownerFroggies.address, bob.address, TOKEN_SENT);
    });
  });

  describe('Getters', function () {
    it('Should return the address of the supplier', async function () {
      expect(await faucet.connect(alice).ownerSupplyAddress()).to.equal(ownerFroggies.address);
    });
    it('Should return the balance of the supplier address', async function () {
      expect(await faucet.connect(alice).ownerTokenSupply()).to.equal(INITIAL_SUPPLY);
    });
    it('Should return the contract address of the Froggies Token', async function () {
      expect(await faucet.connect(bob).tokenAddress()).to.equal(froggies.address);
    });
    it('Should return the time remaining before you can get more tokens from the faucet', async function () {
      expect(await faucet.connect(charlie).countdown()).to.equal(0);
      await faucet.connect(charlie).getTokens();
      expect(await faucet.connect(charlie).countdown()).to.equal(TIME_RESTRICTION);
      await ethers.provider.send('evm_increaseTime', [1000]);
      await ethers.provider.send('evm_mine');
      expect(await faucet.connect(charlie).countdown()).to.equal(TIME_RESTRICTION - 1000);
      await ethers.provider.send('evm_increaseTime', [TIME_RESTRICTION]);
      await ethers.provider.send('evm_mine');
      expect(await faucet.connect(charlie).countdown()).to.equal(0);
    });
    it('Should return number of token send by the faucet each time', async function () {
      expect(await faucet.connect(alice).value()).to.equal(TOKEN_SENT);
    });
    it('Should return the time restriction()', async function () {
      expect(await faucet.connect(charlie).timeRestriction()).to.equal(TIME_RESTRICTION);
    });
  });
});
