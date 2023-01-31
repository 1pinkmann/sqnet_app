import { useCallback, useContext, useEffect, useState } from "react";
import { Web3Context } from './../contexts/Web3Provider';
import { SqtContractContext } from './../contexts/SqtContractProvider';

export default function useBalance() {
    const { SqtContract } = useContext(SqtContractContext);
    const { accounts } = useContext(Web3Context);
    const [balance, setBalance] = useState(0);

    const getBalance = useCallback(() => {
        let mounted = true;
        if (!SqtContract || !accounts || accounts.length === 0) return;

        async function fetchBalance() {
            return await SqtContract.methods.balanceOf(accounts[0]).call();
        }

        fetchBalance().then(result => {
            if (!mounted) return;
            setBalance((result && result.length > 0) ? result : 0);
        });

        return () => {
            mounted = false;
        }
    }, [SqtContract, accounts]);

    useEffect(() => {
        getBalance();
    }, [getBalance]);

    return {
        balance,
        getBalance
    }
}
