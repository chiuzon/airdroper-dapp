<script lang="ts">
	import { svelteWeb3 } from '@chiuzon/svelteweb3'
    import {injectedConnector} from '$lib/constants'
    import ConnectedView from './ConnectedView.svelte';

    const { activate, error, account } = svelteWeb3()

    const onConnectButton = async () => {
        await activate(injectedConnector, async (e) => {
            //You can ask here the user if he wanna switch networks or show a popup modal
            console.error(e)
        })
    }
</script>

<h1>TokenAirdroper on Telos</h1>

<div class="connect-box">
    {#if $account}
        <ConnectedView />
    {:else}
        <p>{$error ?? 'Please use chainId 40 / TelosEVM Mainnet'}</p>
        <button on:click={onConnectButton}>
            Connect
        </button>
    {/if}
</div>

<style>
    .connect-box {
        display: flex;
        flex-direction: column;
    }
</style>