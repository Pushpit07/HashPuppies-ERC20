const { assert } = require("chai");
require('chai').use(require('chai-as-promised')).should()

const HashPuppies = artifacts.require('./HashPuppies.sol');

contract('HashPuppies', ([deployer, seller, buyer]) => {
  let hashpuppies;

  before(async () => {
    hashpuppies = await HashPuppies.deployed();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await hashpuppies.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('has a name', async () => {
      const name = await hashpuppies.name();
      assert.equal(name, 'HashPuppies');
    });
  });

  describe('puppies', async () => {
    let result, puppiesCount;

    before(async () => {
      result = await hashpuppies.createPuppy('Shiba Inu', web3.utils.toWei('1', 'Ether'), { from: seller });
      puppiesCount = await hashpuppies.puppiesCount();
    });

    it('creates puppies', async () => {
      // Success
      assert.equal(puppiesCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), puppiesCount.toNumber(), 'id is correct');
      assert.equal(event.name, 'Shiba Inu', 'name is correct');
      assert.equal(event.price, web3.utils.toWei('1', 'Ether'), 'price is correct');
      assert.equal(event.owner, seller, 'owner is correct');
      assert.equal(event.purchased, false, 'purchased is correct');

      // Failure: Puppy must have a name
      await hashpuppies.createPuppy('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;

      // Failure: Puppy must have a price
      await hashpuppies.createPuppy('Shiba Inu', 0, { from: seller }).should.be.rejected;
    });

    it('lists puppies', async () => {
      const puppy = await hashpuppies.puppies(puppiesCount);
      assert.equal(puppy.id.toNumber(), puppiesCount.toNumber(), 'id is correct');
      assert.equal(puppy.name, 'Shiba Inu', 'name is correct');
      assert.equal(puppy.price, web3.utils.toWei('1', 'Ether'), 'price is correct');
      assert.equal(puppy.owner, seller, 'owner is correct');
      assert.equal(puppy.purchased, false, 'purchased is correct');
    });

    it('sells puppies', async () => {
      // Track seller balance before purchase
      let oldSellerBalance;
      oldSellerBalance = await web3.eth.getBalance(seller);
      oldSellerBalance = new web3.utils.BN(oldSellerBalance);

      //Success: Buyer makes purchase
      const result = await hashpuppies.purchasePuppy(puppiesCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') });

      // Check logs
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), puppiesCount.toNumber(), 'id is correct');
      assert.equal(event.name, 'Shiba Inu', 'name is correct');
      assert.equal(event.price, web3.utils.toWei('1', 'Ether'), 'price is correct');
      assert.equal(event.owner, buyer, 'owner is correct');
      assert.equal(event.purchased, true, 'purchased is correct');

      // Check that seller received funds
      let newSellerBalance;
      newSellerBalance = await web3.eth.getBalance(seller);
      newSellerBalance = new web3.utils.BN(newSellerBalance);

      let price;
      price = web3.utils.toWei('1', 'Ether');
      price = new web3.utils.BN(price);

      const expectedBalance = oldSellerBalance.add(price);
      assert.equal(newSellerBalance.toString(), expectedBalance.toString());

      // Failure: Tries to buy a puppy that does not exist- Must have valid id
      await hashpuppies.purchasePuppy(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      // Failure: Tries to buy without enough ether
      await hashpuppies.purchasePuppy(puppiesCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // Failure: Deployer tried to buy the puppy- Puppy cannot be purchased twice
      await hashpuppies.purchasePuppy(puppiesCount, { from: deployer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // Failure: Buyer tries to buy again- Buyer can't be the seller
      await hashpuppies.purchasePuppy(puppiesCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
    });
  });
});
