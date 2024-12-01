import test from 'ava';
import { start } from './contracts/ago-lender.contract.js';

test('Lending and Borrowing', async t => {
  const contract = await start(zcf, privateArgs);

  const publicFacet = await E(contract).getPublicFacet();

  // Mock lender
  await lendAssets(zoe, publicFacet, { brand: 'USD', value: 100 }, 'Lender1');

  // Mock borrower
  await borrowAssets(
    zoe,
    publicFacet,
    { brand: 'USD', value: 150 },
    { brand: 'USD', value: 100 },
    'Borrower1'
  );

  t.pass();
});
