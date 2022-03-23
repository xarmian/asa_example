import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

(async () => {
    const displayBalances = async (name,acc,tokid) => {
        const balAlgo = await stdlib.balanceOf(acc);
        const balUSDC = await stdlib.balanceOf(acc, tokid);
        console.log(`${name} has ${stdlib.formatCurrency(balAlgo, 6)} ALGO and ${stdlib.formatCurrency(balUSDC,6)} USDC`);
    
    };

    // create test account for Alice and fund with 10 network tokens
    const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(10));
    const accBob = await stdlib.newTestAccount(stdlib.parseCurrency(10));

    // Devnet only: create ASA token to use as USDC
    const usdcTok = await stdlib.launchToken(accAlice, "USDC", "USDC", {supply: stdlib.parseCurrency(100)});

    // opt Alice and Bob in to USDC token
    await accAlice.tokenAccept(usdcTok.id);
    await accBob.tokenAccept(usdcTok.id);

    // Balances of ALGO and USDC before deploying contract
    displayBalances('Alice',accAlice,usdcTok.id);
    displayBalances('Bob',accBob,usdcTok.id);

    // deploy contract, which will require Alice to pay 1 USDC
    const ctcAlice = accAlice.contract(backend);
    const ctcBob = accBob.contract(backend,ctcAlice.getInfo());

    const Common = {
        log: (txt) => {
            console.log(txt);
        }
    }
    await Promise.all([
        backend.Alice(ctcAlice, {
            ...Common,
            specifyToken: () => {
                console.log(`Alice specifies the token id of ${usdcTok.id}`);
                return usdcTok.id;
            }
        }),
        backend.Bob(ctcBob, {
            ...Common,
        }),
    ]);
      
    // Alice's balances of ALGO and USDC after deploying contract
    displayBalances('Alice',accAlice,usdcTok.id);
    displayBalances('Bob',accBob,usdcTok.id);

})();