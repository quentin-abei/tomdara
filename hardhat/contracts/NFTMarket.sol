// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarket is ERC721URIStorage{
    using Counters for Counters.Counter;
    using SafeMath for uint;
    Counters.Counter private _tokenIds;

    struct NftListing {
        uint price;
        address seller;
    }

    mapping (uint => NftListing) private listings;

    error PriceMustBeGreaterThanZero();
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
    }

   /**
    * listNFT, list an nft for sale
    * @param tokenId, the nft ID
    * @param price , the price of nft
    */
   function listNFT(uint tokenId, uint price) public {
        if (price <=0) {
            revert PriceMustBeGreaterThanZero();
        }
        approve(address(this), tokenId);
        transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = NftListing(price, msg.sender);
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
   }
}