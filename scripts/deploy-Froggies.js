const hre = require('hardhat');
const { deployed } = require('./deployed');

async function main() {
  const INITIAL_SUPPLY = ethers.utils.parseEther('1000000000');
  const NAME = 'Froggies';
  const SYM = 'FRG';

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Optionnel car l'account deployer est utilisé par défaut
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy
  const Froggies = await hre.ethers.getContractFactory('Froggies');
  const froggies = await Froggies.deploy(deployer.address, INITIAL_SUPPLY, NAME, SYM);

  // Attendre que le contrat soit réellement déployé, cad que la transaction de déploiement
  // soit incluse dans un bloc
  await froggies.deployed();

  // Create/update deployed.json and print usefull information on the console.
  await deployed('Froggies', hre.network.name, froggies.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
