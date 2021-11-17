<script lang="ts">
    import { svelteWeb3 } from '@chiuzon/svelteweb3'
import { BigNumber, ethers } from 'ethers';
import { onMount } from 'svelte';

    const { library, account} = svelteWeb3()

    const AirdropAddress = "0xbc2356C24E01c5e021e87b006433aCeF03106870"
    
    let tokenContract;
    let tokenAddress;
    let tokenTax;

    let airdrops = []

    const AirdropABI = [
        "function telosTax() public view returns(uint256)",
        "function airdrop(address tokenAddress,address[] calldata addressList,uint256[] calldata amountList) public payable"
    ]

    const ERC20Abi = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)",
        "function allowance(address _owner, address spender) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)"
    ]

    const airdropContract = new ethers.Contract(AirdropAddress, AirdropABI, $library.getSigner())

    const onTokenAddressChange = (e: any) => {
        if(e.currentTarget.value.length <= 0){
            return
        }
        
        if(ethers.utils.isAddress(e.currentTarget.value)){
            tokenAddress = ethers.utils.getAddress(e.currentTarget.value)

            if(isTokenValid(tokenAddress)){
                tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, $library.getSigner())
            }
        }
    }

    function isTokenValid(tokenAddr: string) {
        try {
            return new ethers.Contract(tokenAddr, ERC20Abi, $library.getSigner())
        }catch{
            return false
        }
    }

    let airdropAddress;
    let airdropAmount;

    let tokenDecimals;
    let isAllowed;

    let accountBalance;

    $: tokenContract && (async () => {
        try{
            const tD = await tokenContract.decimals()

            tokenDecimals = tD.toString()
        }catch{
            console.error("Couldn't fetch decimals")
        }
    })()

    async function checkAllowance() {
        const allowance = await tokenContract.allowance($account, airdropContract.address)
        console.log(allowance.toString())
        isAllowed = BigNumber.from(allowance) > BigNumber.from(0)
    }

    $: tokenContract && checkAllowance()

    $: tokenContract && (async () => {
        const bal = await tokenContract.balanceOf($account)
        
        accountBalance = bal
    })()


    function onAddNewAirdrop() {
        if(!ethers.utils.isAddress(airdropAddress)){
            return;
        }

       if(Number.isNaN(airdropAmount)){
            return
       }

       if(airdropAmount <= 0){
           return
       }

        airdrops.push({
            address: airdropAddress,
            amount: ethers.utils.parseUnits(`${airdropAmount}`, tokenDecimals)
        })

        airdrops = airdrops

        airdropAddress = ""
        airdropAmount = ""

        console.log(airdrops)
    }   

    onMount(async () => {
        const rawTaxFee = await airdropContract.telosTax()
        

        tokenTax = ethers.utils.formatEther(rawTaxFee)
    })

    function _if(condition, object){
        try{
            return condition ? object : ''
        }catch{
            return ''
        }
    }

    async function allowTokenUse() {
        const approveTX = await tokenContract.approve(airdropContract.address, ethers.utils.parseEther("100000000000000"))

        await approveTX.wait()

        await checkAllowance()
    }

    async function airdrop() {
        if(airdrops.length <= 0){
            return;
        }

        if(getTotalAmountRequiredBN(airdrops) < accountBalance ){
            return;
        }

        const addresses = airdrops.map((value) => value.address)
        const amounts =  airdrops.map((value) => value.amount)
        console.log(addresses)
        console.log(amounts)

        const rawTaxFee = await airdropContract.telosTax()

        const airdropTX = await airdropContract.airdrop(
            tokenContract.address,
            addresses,
            amounts,
            {
                value: rawTaxFee
            }
        )

        await airdropTX.wait()
    }   

    function getTotalAmountRequiredBN(airdropArr) {
        if(airdropArr.length <= 0){
            return ''
        }

        let total = BigNumber.from("0")

        airdropArr.forEach((val) => {
            total = total.add(val.amount)
        })

        return total
    }

    function getTotalAmountRequired(airdropArr) {
        if(airdropArr.length <= 0){
            return ''
        }

        let total = BigNumber.from("0")

        airdropArr.forEach((val) => {
            total = total.add(val.amount)
        })

        return ethers.utils.formatUnits(total, tokenDecimals)
    }
</script>
<p class="">Info: Decimals are added by default </p>
<p>Connected as: {$account}</p>
<p>Dapp Fee: {`${tokenTax} TLOS` ?? ''} </p>
{#if !tokenContract}
    <h2>Token Address: <input on:change={onTokenAddressChange} /></h2>
    
    {!tokenAddress ? 'Invalid Token Address' : ''}

{/if}

<p>{_if(tokenAddress,`Token Address: ${tokenAddress}`)}</p>
<p>{_if(tokenDecimals,`Token Decimals: ${tokenDecimals}`)}</p>

{#if isTokenValid(tokenAddress)}
    <hr />
    <div class="list-box">
        {#each airdrops as airdrop, index }
            <p>Address: {airdrop.address} | Amount: {ethers.utils.formatUnits(airdrop.amount, tokenDecimals)}| <button class="btn close" on:click={() => {
                airdrops = airdrops.filter((_m, i) => i !== index);
            }}>X</button></p>
        {/each}

        {#if airdrops.length <= 0}
            <p>0 addresses to airdrop too, please add an address</p>
        {/if}
    </div>
    
    <hr />
    <div class="input-box">
        <p>Address: <input bind:value={airdropAddress} placeholder="0x4c6996..." /></p>
        <p>Amount to send: <input bind:value={airdropAmount} type="number" /></p>
        <p><button on:click={onAddNewAirdrop}>Add Address in Airdrop List</button></p>
    </div>
    <hr />
    {#if airdrops.length > 0}
        <p>Available Amount: { _if(accountBalance, `${ethers.utils.formatUnits(`${accountBalance}`, tokenDecimals)}`)}</p>
        <p>Total Required: {getTotalAmountRequired(airdrops)}</p>
    {/if}
    <hr />
    {#if isAllowed }
        <button on:click={airdrop}>Send airdrop</button>
    {:else}
        <button on:click={allowTokenUse}>Allow Token Usage</button>
    {/if}
{/if}

<style>
    .list-box {
        padding: 5px;
        border-width: 1px;
        border-color: rgb(49, 47, 47);
        border-style: solid;

        background-color: rgba(0, 0, 0, 0.376);

        overflow: auto;
        max-height: 10rem;
    }

    .input-box {

        padding: 5px;
        border-width: 1px;
        border-color: black;
        border-style: solid;

        background-color: rgba(0, 0, 0, 0.575);
    }

    .btn.close {
        padding: 10px;
        background-color: rgb(98, 0, 0);
        color: red;

        border-style: none;
    }
</style>