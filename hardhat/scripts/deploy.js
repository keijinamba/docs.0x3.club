async function main() {
  const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
  const contract = await SimpleNFT.deploy();
  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });