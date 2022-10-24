import { ethers } from "hardhat";

async function deployExchangeableToken() {
  const ExchangeableToken = await ethers.getContractFactory("ExchangeableToken");
  const exchangeableToken = await ExchangeableToken.deploy();
  await exchangeableToken.deployed();
  console.log(`ExchangeableToken deployed to ${exchangeableToken.address}`);
}
async function deployLock() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;
  const lockedAmount = ethers.utils.parseEther("1");
  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  await lock.deployed();
  console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`);
}

async function main() {
  await deployExchangeableToken();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
