<script lang="ts">
    import { svelteWeb3 } from '@chiuzon/svelteweb3'
    import { BigNumber, ethers } from 'ethers';
    import { errorStore } from '$lib/stores/errorStore';
    import { _if } from '$lib/helpers/renderHelper'
    import { airdropContract, aidropFee, erc20Contract } from '$lib/stores/contractStores';
    import { isTokenValid } from '$lib/helpers/tokenHelper';

    const { library, account} = svelteWeb3()
    const { error: pageErrors , onError } = errorStore()
    const airdropContractInstance = airdropContract()

    let tokenContract
    let airdropList = []

    let formAddressInput
    let formAmountInput
    
    $: tokenDecimals = $tokenContract?.decimals().then((result) => {
        tokenDecimals = {
            BN: result,
            formated: result.toString()
        }
    })

    $: tokenName = $tokenContract?.name().then((result) => {
        tokenName = result
    })

    $: isApproved = $tokenContract?.allowance($account, $airdropContractInstance.address).then((result) => {
        isApproved = BigNumber.from(result) > BigNumber.from(0)
    })

    $: tokenBalance = $tokenContract?.balanceOf($account).then((result) => {
        tokenBalance = {
            BN: BigNumber.from(result),
            formated:  ethers.utils.formatUnits(result, tokenDecimals.BN)
        }
    })

    $: requiredAmount = ((arr: any[]) => {
        if(arr.length <= 0){
            return {
                BN: BigNumber.from("0"),
                formated: "0"
            }
        }

        let total = BigNumber.from("0")

        arr.forEach((val) => {
            total = total.add(val.amount)
        })

        return {
            BN: total,
            formated: ethers.utils.formatUnits(total, tokenDecimals.BN)
        }
    })(airdropList)

    const onTokenAddressChange = (e: any) => {
        if(e.currentTarget.value.length <= 0){
            return;
        }

        if(!ethers.utils.isAddress(e.currentTarget.value)){
            return;
        }

        if(!isTokenValid(e.currentTarget.value)){
            return;
        }

        tokenContract = erc20Contract(e.currentTarget.value)
    }

    const addAirdropNewElement = () => {
        if(!ethers.utils.isAddress(formAddressInput)){
            onError("Invalid Address")
            return;
        }

        if(Number.isNaN(formAmountInput)){
            onError("Input just numbers")
            return
        }

        if(formAmountInput <= 0){
           onError("Can't send 0 amount")
           return
        }

        airdropList.push({
            address: formAddressInput,
            amount: ethers.utils.parseUnits(`${formAmountInput}`, tokenDecimals.BN)
        })

        airdropList = airdropList

        formAddressInput = ""
        formAmountInput = ""
    }

    async function approveTokenUsage() {
        const approveTX = await $tokenContract.connect($library.getSigner()).approve($airdropContractInstance.address, ethers.utils.parseEther("100000000000000"))

        await approveTX.wait()

        $tokenContract?.allowance($account, $airdropContractInstance.address).then((result) => {
            isApproved = BigNumber.from(result) > BigNumber.from(0)
        })
    }

    async function airdropTokens() {
        if(airdropList.length <= 0){
            onError("Airdrop list is empty!")
            return;
        }

        if(requiredAmount.BN.gt(tokenBalance.BN )){
            console.log(tokenBalance)
            console.log(requiredAmount)
            onError("Not enough tokens!")
            return;
        }

        const addresses = airdropList.map((value) => value.address)
        const amounts =  airdropList.map((value) => value.amount)

        try{
            const taxFee = await $aidropFee

            const airdropTX = await $airdropContractInstance.airdrop(
            $tokenContract.address,
            addresses,
            amounts,
                {
                 value: taxFee.bnTax
                }
            )

            onError("Sending airdrop...")

            await airdropTX.wait()

            onError("Airdrop sent")
        }catch(e){
            onError(e)
        }
    }
</script>

{#if $pageErrors}
    <div class="box">
        <p class="has-text-danger has-text-weight-bold">{$pageErrors}</p>
    </div>
{/if}

<div class="box">
    <p class="has-text-info has-text-weight-semibold">Info: Decimals are added by default </p>
    {#await $aidropFee then taxFee}
        <p>Dapp Fee: {`${taxFee.tax} TLOS` ?? ''}</p>
    {/await}
</div>

{#if $tokenContract}
    <div class="box">
        <p class="has-text-weight-semibold">Token Address: {$tokenContract.address}</p>
        <p>Token Name: {_if(tokenName, `${tokenName}`)}</p>
        <p>Token Decimals: {_if(tokenDecimals, `${tokenDecimals.formated}`)}</p>
    </div>

    <div class="box table-container">
        <table class="table is-fullwidth is-narrow">
            <thead>
              <tr>
                <th><abbr title="index">Index</abbr></th>
                <th>Address</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            {#if airdropList.length > 0}
                {#each airdropList as airdrop, index }
                    <tr>
                        <td>{index}</td>
                        <td>{airdrop.address}</td>
                        <td>{_if(tokenDecimals, `${ethers.utils.formatUnits(airdrop.amount, tokenDecimals.BN)}`)}</td>
                        <td>
                            <button class="button is-small is-danger" on:click={() => {
                                airdropList = airdropList.filter((_e, i) => i !== index)
                            }}>Delete</button>
                        </td>
                    </tr>
                {/each}
            {/if}
            <tr>
                <td></td>
                <td class="control is-expanded">
                    <input bind:value={formAddressInput} class="input" type="text" placeholder="0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C">
                </td>
                <td class="control is-expanded">
                    <input bind:value={formAmountInput} class="input" type="number" placeholder="1">
                </td>
                <td class="control">
                    <button on:click={addAirdropNewElement} class="button is-info">
                        Add Address
                    </button>
                </td>
            </tr>
            </tbody>
          </table>
    </div>

    {#if airdropList.length > 0}
        <div class="box">
            <div class="field is-grouped">
                <p class="control is-expanded">
                    Token Balance: {_if(tokenBalance, `${tokenBalance.formated}`)}
                </p>

                <p class="control is-expanded">
                    Required Token Amount: {_if(requiredAmount, `${requiredAmount.formated}`)}
                </p>
                
                <p class="control">
                    {#if isApproved}
                        <button on:click={airdropTokens} class="button is-info">
                           Send airdrop
                        </button>
                    {:else}
                        <button on:click={approveTokenUsage} class="button is-success">
                            Allow {_if(tokenName, `${tokenName}`)}
                        </button>
                    {/if}
                </p>
            </div>
        </div>
    {/if}
{:else}
<div class="box">
    <div class="field">
      <label for="tokenAddress" class="label">Token Address</label>
      <div id="tokenAddress" class="control">
        <input on:change|preventDefault={onTokenAddressChange} class="input" placeholder="0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C">
      </div>
    </div>
</div>
{/if}
