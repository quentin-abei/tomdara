import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";



describe("NFTMarket",() => {
   async function deployNFTMarketFixture() {
    const [owner, random] = await ethers.getSigners();
    const NFTMARKET = await ethers.getContractFactory("NFTMarket");
    const Nftmarket = await NFTMARKET.deploy();
    const tokenURI = 'https://something';
     const create = await Nftmarket.createNFT(tokenURI);

    return {Nftmarket, owner, random, create, tokenURI};
   };
   describe("Deployment", ()=> {
    it("Should create an NFT",async () => {
     const {Nftmarket, owner, create, tokenURI} = await loadFixture(deployNFTMarketFixture);
     
     const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     expect(await Nftmarket.tokenURI(tokenId)).to.equal(tokenURI);
     const ownerAdd = await owner.getAddress();
     expect(await Nftmarket.ownerOf(tokenId)).to.equal( ownerAdd);
     
    })
  })

  describe("listNft", () => {
    it("Should revert if price is zero",async () => {
      const {Nftmarket,  create} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
      expect( Nftmarket.listNFT(tokenId, 0)).to.be.revertedWith("price must be greater than zero");
    });
    it("should list an NFT and emit an event if price > zero",async () => {
      const {Nftmarket,  create, owner} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     const add = owner.getAddress();
      expect( Nftmarket.listNFT(tokenId, 1)).to.emit(Nftmarket, "NftTransfer").withArgs(tokenId, add, Nftmarket.address, "", 1);
    });
    it('Should revert if lister is not the owner',async () => {
      const {Nftmarket,  create, random} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     expect(Nftmarket.connect(random).listNFT(tokenId, 12)).to.be.revertedWith("ERC721: approve caller is not token owner or approved for all");
    })
  })

  describe("buyNft", ()=> {
    it("should list an NFT, cancel listing and revert on buy",async () => {
      const {Nftmarket,  create, owner} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     const add =  owner.getAddress();
      expect( Nftmarket.listNFT(tokenId, 1)).to.emit(Nftmarket, "NftTransfer").withArgs(tokenId, add, Nftmarket.address, "", 1);
     const cancelListing =  Nftmarket.cancelListing(tokenId);
     expect(cancelListing).to.emit(Nftmarket, "NftTransfer").withArgs(tokenId,Nftmarket.address, add, "", 0);
     const buyWillRevert = Nftmarket.buyNFT(tokenId);
     expect(buyWillRevert).to.be.revertedWith("This nft is not for sale");
    });
    it("should list an NFT, and revert on buy if user does not send enough ether",async () => {
      const {Nftmarket,  create, owner} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     const add =  owner.getAddress();
     const listNft =  Nftmarket.listNFT(tokenId, 2)
     const buyWillRevert = Nftmarket.buyNFT(tokenId, {value: ethers.utils.parseEther("1")});
     expect(buyWillRevert).to.be.revertedWithCustomError(Nftmarket, "NotEnoughFunds");
    });
    it("should list an NFT, and exceute buy function",async () => {
      const {Nftmarket,  create, owner} = await loadFixture(deployNFTMarketFixture);
      const receipt = await create.wait();
     const tokenId = receipt.events[0].args.tokenId;
     const add =  owner.getAddress();
     const listNft =  Nftmarket.listNFT(tokenId, 2)
     const buyWillSucceed = Nftmarket.buyNFT(tokenId, {value: ethers.utils.parseEther("2")});
     expect(buyWillSucceed).to.emit(Nftmarket, "NftTransfer").withArgs(tokenId,Nftmarket.address, owner.address, "", 0);
    });
  })
})


// describe("Lock", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployOneYearLockFixture() {
//     const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//     const ONE_GWEI = 1_000_000_000;

//     const lockedAmount = ONE_GWEI;
//     const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners();

//     const Lock = await ethers.getContractFactory("Lock");
//     const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//     return { lock, unlockTime, lockedAmount, owner, otherAccount };
//   }

//   describe("Deployment", function () {
//     it("Should set the right unlockTime", async function () {
//       const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

//       expect(await lock.unlockTime()).to.equal(unlockTime);
//     });

//     it("Should set the right owner", async function () {
//       const { lock, owner } = await loadFixture(deployOneYearLockFixture);

//       expect(await lock.owner()).to.equal(owner.address);
//     });

//     it("Should receive and store the funds to lock", async function () {
//       const { lock, lockedAmount } = await loadFixture(
//         deployOneYearLockFixture
//       );

//       expect(await ethers.provider.getBalance(lock.address)).to.equal(
//         lockedAmount
//       );
//     });

//     it("Should fail if the unlockTime is not in the future", async function () {
//       // We don't use the fixture here because we want a different deployment
//       const latestTime = await time.latest();
//       const Lock = await ethers.getContractFactory("Lock");
//       await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
//         "Unlock time should be in the future"
//       );
//     });
//   });

//   describe("Withdrawals", function () {
//     describe("Validations", function () {
//       it("Should revert with the right error if called too soon", async function () {
//         const { lock } = await loadFixture(deployOneYearLockFixture);

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet"
//         );
//       });

//       it("Should revert with the right error if called from another account", async function () {
//         const { lock, unlockTime, otherAccount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime);

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner"
//         );
//       });

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const { lock, unlockTime } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).not.to.be.reverted;
//       });
//     });

//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });

//     describe("Transfers", function () {
//       it("Should transfer the funds to the owner", async function () {
//         const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount]
//         );
//       });
//     });
//   });
// });
