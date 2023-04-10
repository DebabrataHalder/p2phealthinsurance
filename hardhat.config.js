require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */



require("@nomicfoundation/hardhat-toolbox");

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and replace "KEY" with it
const INFURA_API_KEY = "bRwJCKHBKr1GbxWdaLBPalyqD2A0oXCC";

// Replace this private key with your Sepolia account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY = "0ee8b5341aebfbfab065a05215af8c7ec18a0094d58d5bf3b1c480feb6e1808e";

module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/bRwJCKHBKr1GbxWdaLBPalyqD2A0oXCC`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
