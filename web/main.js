const NFTContract = require("../hardhat/artifacts/contracts/SimpleNFT.sol/SimpleNFT.json");
const Web3 = require("web3");

const { ethereum } = window;
const web3 = new Web3(ethereum);

const CONTRACT_ADDRESS = "0xd232B0121686304A46a80F1a87Ca2a245b54D873";
const TOKEN_URI = "https://gateway.pinata.cloud/ipfs/QmYZMM98nNya8BGkvwrhHUAdx57wApgs1gsp3D5qUo5Edc";

window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("mint-button");
  button.addEventListener("click", async () => {
    const [walletAddress] = await ethereum.request({
      method: "eth_requestAccounts",
    }).catch(console.error);
    
    console.log("walletAddress", walletAddress);

    const abi = NFTContract.abi;
    const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    const data = contract.methods.mintNFT(walletAddress, TOKEN_URI).encodeABI();

    const transaction = {
      from: walletAddress,
      to: CONTRACT_ADDRESS,
      data
    };

    const txHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [transaction],
    }).catch(console.error);
    
    console.log("txHash", txHash);

    alert(`NFT minted! Transaction Hash: ${txHash}`)
  });
});