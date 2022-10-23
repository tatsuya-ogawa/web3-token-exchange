import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ExchangeableToken } from "../typechain-types";
import { MyERC20Token } from "../typechain-types/MyERC20Token";

const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("ERC20-BEP20 token", function () {
  let [accountA, accountB, accountC]:SignerWithAddress[] = [];
  let token:ExchangeableToken;
  const amount = 100;
  const totalSupply = 1000000;
  beforeEach(async () => {
    [accountA, accountB, accountC] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ExchangeableToken");
    token = await Token.deploy();
    await token.deployed();
    await token.mint(1000000);
  });
  describe("common", function () {
    it("total supply should return righr value", async function () {
      expect(await token.totalSupply()).to.be.equal(totalSupply);
    });
    it("balance of account A should return righr value", async function () {
      expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply);
    });
    it("balance of account B should return righr value", async function () {
      expect(await token.balanceOf(accountB.address)).to.be.equal(0);
    });
    it("allowance of account A to account B should return righr value", async function () {
      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(0);
    });
  });
  describe("transfer", function () {
    it("transfer should revert if amount exceeds balance", async function () {
      await expect(token.transfer(accountB.address, totalSupply + 1)).to.be
        .reverted;
    });
    it("transfer should work correctly", async function () {
      const transferTx = await token.transfer(accountB.address, amount);
      expect(await token.balanceOf(accountA.address)).to.be.equal(
        totalSupply - amount
      );
      expect(await token.balanceOf(accountB.address)).to.be.equal(amount);
      await expect(transferTx)
        .to.emit(token, "Transfer")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
  describe("transferFrom", function () {
    it("transferFrom should revert if amount exceeds balance", async function () {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, totalSupply + 1)
      ).to.be.reverted;
    });
    it("transferFrom should revert if amount exceeds allowance balance", async function () {
      await expect(
        token
          .connect(accountB)
          .transferFrom(accountA.address, accountC.address, amount)
      ).to.be.reverted;
    });
  });
  it("transferFrom should work correctly", async function () {
    await token.approve(accountB.address, amount);
    const transferFromTx = await token
      .connect(accountB)
      .transferFrom(accountA.address, accountC.address, amount);
    expect(await token.balanceOf(accountA.address)).to.be.equal(
      totalSupply - amount
    );
    expect(await token.balanceOf(accountC.address)).to.be.equal(amount);
    await expect(transferFromTx)
      .to.emit(token, "Transfer")
      .withArgs(accountA.address, accountC.address, amount);
  });
  describe("approve", function () {
    it("approve should work correctly", async function () {
      const approveTx = await token.approve(accountB.address, amount);
      expect(
        await token.allowance(accountA.address, accountB.address)
      ).to.be.equal(amount);
      await expect(approveTx)
        .to.emit(token, "Approval")
        .withArgs(accountA.address, accountB.address, amount);
    });
  });
});