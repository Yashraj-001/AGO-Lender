import { E } from '@endo/far';
import { bundleSource } from '@agoric/bundle-source';

const deployContract = async () => {
  // Assuming you have a Zoe instance available (you can mock this in development)
  const zoe = await import('@agoric/zoe');  // Adjust this if necessary

  // Bundle the contract code
  const bundle = await bundleSource('./contracts/ago-lender.contract.js'); // Path to your contract file

  // Install the contract on Zoe
  const installation = await E(zoe).install(bundle);

  console.log('Contract installed:', installation);
};

deployContract().catch(err => {
  console.error('Deployment failed:', err);
});

