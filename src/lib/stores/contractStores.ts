import { derived, readable } from "svelte/store";
import { svelteWeb3 } from '@chiuzon/svelteweb3'
import {ethers} from 'ethers'

import { AIRDROP_ABI, AIRDROP_CONTRACT_ADDRESS, ERC20_CONTRACT } from "$lib/constants";

import { getUnixTimestamp } from "$lib/helpers/timeHelpers";

export const block = readable(getUnixTimestamp(), function start(set) {
	const interval = setInterval(() => {
		set(getUnixTimestamp());
	}, 500);

	return function stop() {
		clearInterval(interval);
	};
});


export const contractStore = (address: string, abi: any[]) => {
    return derived(svelteWeb3().library, ($lib) => {
        return new ethers.Contract(address, abi, $lib.getSigner())
    })
}

export function airdropContract() {
   return contractStore(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI)
}

export function erc20Contract(tokenAddress: string) {
    return contractStore(tokenAddress, ERC20_CONTRACT)
}

export const aidropFee = derived(airdropContract(), async ($contract) => {
    const rawTaxFee = await $contract.telosTax()

    return {
        bnTax: rawTaxFee,
        tax: ethers.utils.formatEther(rawTaxFee)
    }
})