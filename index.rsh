'reach 0.1';
'use strict';

const B32 = Bytes(64);

export const main = Reach.App(() => {
    const Common = {
        log: Fun([Bytes(64)],Null),
    }
    const Alice = Participant('Alice', {
        ...Common,
        specifyToken: Fun([], Token),
    });
    const Bob = Participant('Bob', {
        ...Common,
    });
    init();

    Alice.only(() => {
        const tok = declassify(interact.specifyToken());
    });
    Alice.publish(tok);
    commit();

    Alice.only(() => {
        interact.log(B32.pad('Alice is paying 1 USDC'));
    });
    Alice.pay([[ 1000000, tok ]]);
    commit();

    Bob.only(() => {
        interact.log(B32.pad('Bob binds to the contract to get paid'));
    });
    Bob.publish();
    transfer(1000000, tok).to(Bob);
    commit();

    exit();
});
