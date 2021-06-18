const hre = require('hardhat');
const { readFile } = require('fs/promises');

async function main() {
  const INITIAL_SUPPLY = ethers.utils.parseEther('1000000000');
  const FILE_PATH = './deployed.json';
  const CONTRACT_FAUCET = 'Faucet';
  const CONTRACT_FROGGIES = 'Froggies';

  // Open and Read current FILE_PATH if exists
  let jsonString = '';
  let obj = {};
  try {
    jsonString = await readFile(FILE_PATH, 'utf-8');
    obj = JSON.parse(jsonString);
  } catch (e) {
    console.error(e);
  }
  const froggiesAddress = obj[CONTRACT_FROGGIES][hre.network.name].address;
  const faucetAddress = obj[CONTRACT_FAUCET][hre.network.name].address;
  console.log('This is the Faucet Contract address', faucetAddress);

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy
  const Froggies = await hre.ethers.getContractFactory('Froggies');
  const froggies = await Froggies.attach(froggiesAddress);
  if (hre.network.name !== 'mainnet') {
    await froggies.approve(faucetAddress, INITIAL_SUPPLY);
  }
  const allowance = await froggies.allowance(deployer.address, faucetAddress);
  console.log('Allowance of Faucet contract', allowance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
