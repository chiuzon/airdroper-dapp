<script lang="ts">
	import { svelteWeb3 } from '@chiuzon/svelteweb3'
    import ConnectedView from './ConnectedView.svelte';
    import ConnectButton from '$lib/components/ConnectButton.svelte'
    const { error, account } = svelteWeb3()

</script>



<div class="connect-box">
    {#if $account}
        <ConnectedView />
    {:else}
        <p class="is-size-5 has-text-weight-semibold">{$error ?? 'Please use ChainId 40 / TelosEVM Mainnet'}</p>
        <ConnectButton />
    {/if}
</div>

