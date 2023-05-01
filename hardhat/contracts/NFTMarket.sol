// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarket is ERC721URIStorage{
    using Counters for Counters.Counter;
    using SafeMath for uint;
    Counters.Counter private _tokenIds;

    address public wallet = 0xbBD2a13E46A97Ee391c344e8F81dE4a1201a97DC;

    struct NftListing {
        uint price;
        address seller;
    }

    event NftTransfer(uint tokenId, address to, string tokenURI, uint price);

    mapping (uint => NftListing) private listings;

   
    error NotEnoughFunds();

    constructor() ERC721("RAMEN", "RMN"){}
    /**
     * 
     * @param tokenURI The NFT URI
     * returns the current tokenId
     */
    function createNFT(string calldata tokenURI) public   {
        _tokenIds.increment();
        uint newIds = _tokenIds.current();
        _safeMint(msg.sender, newIds);
        _setTokenURI(newIds, tokenURI);
        emit NftTransfer(newIds, msg.sender, tokenURI, 0);
    }

   /**
    * listNFT, list an nft for sale
    * @param tokenId, the nft ID
    * @param price , the price of nft
    */
   function listNFT(uint tokenId, uint price) public {
        require(price > 0, "price must be greater than zero");
        approve(address(this), tokenId);
        transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = NftListing(price, msg.sender);
        emit NftTransfer(tokenId, address(this), "", price);

   }

   /**
    * buyNFT, buy an nft from the market
    * @param tokenId, the nft ID
    */
   function buyNFT(uint tokenId) public payable {
      NftListing memory listing = listings[tokenId];
      require(listing.price > 0, "This nft is not for sale");
      if (msg.value < listing.price) {
        revert NotEnoughFunds();
      }
      transferFrom(address(this), msg.sender, tokenId);
      // send 95% of funds to the seller, market fee 5%
      (bool sent, ) = payable(listing.seller).call{value: listing.price.mul(95).div(100)}("");
      require(sent, "failed to send ether");
      emit NftTransfer(tokenId, msg.sender, "", 0);

   }

   function cancelListing(uint tokenId) public {
        NftListing memory listing = listings[tokenId];
        require(listing.price > 0, "This nft is not for sale");
        require(listing.seller == msg.sender, "You are not the owner");
        approve(msg.sender, tokenId);
        transferFrom(address(this), msg.sender, tokenId);
        clearListing(tokenId);
        emit NftTransfer(tokenId, msg.sender, "", 0);

   }

   function clearListing(uint tokenId) internal view {
    NftListing memory listing = listings[tokenId];
    listing.price = 0;
    listing.seller = address(0);
   }

   function withdrawFee() public OnlyMarket {
    uint balance = address(this).balance;
    (bool sendFee, ) = payable(wallet).call{value: balance}("");
    require(sendFee, "failed to send fee");
   }

   function transferOwnership(address newWallet) public view OnlyMarket {
        require(newWallet != address(0));
        _transferOwnership(newWallet);
   }

   function _transferOwnership(address newWallet) internal view {
    address oldWallet = wallet;
    oldWallet = newWallet;
   }

   modifier OnlyMarket() {
    require(wallet == msg.sender);
    _;
   }
   
   
}