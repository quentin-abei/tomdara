import { ethers } from "hardhat";

async function main() {
  const [owner, random] = await ethers.getSigners();
  const NFTMarket = await  ethers.getContractFactory("NFTMarket");
  const NftMarket = await NFTMarket.deploy();
  await NftMarket.deployed();
  console.log("NFTMarket deployed on sepolia at address:", NftMarket.address);
  console.log("With deployer address:", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
