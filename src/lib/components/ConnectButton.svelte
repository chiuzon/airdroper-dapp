<script lang="ts">
    import { svelteWeb3 } from '@chiuzon/svelteweb3'
    import {injectedConnector} from '$lib/constants'

    const { activate, error, account } = svelteWeb3()

    async function onConnectButton(){
        await activate(injectedConnector, async (e) => {
            //You can ask here the user if he wanna switch networks or show a popup modal
            console.error(e)
        })
    }
</script>


{#if $account}
    <button class="button is-dark">
        <strong>{$account}</strong>
    </button>
{:else}
    <button on:click={onConnectButton} class="button is-primary wfull">
        <strong>Connect</strong>
    </button>
{/if}

<style>
    .wfull {
        width: 100%;
    }
</style>