// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("RAMEN", "RMN"){}
    /**
     * 
     * @param tokenURI The NFT URI
     * returns the current tokenId
     */
    function createNFT(string calldata tokenURI) public returns(uint256)  {
        _tokenIds.increment();
        uint newIds = _tokenIds.current();
        _safeMint(msg.sender, newIds);
        _setTokenURI(newIds, tokenURI);
        return newIds;
    }

}