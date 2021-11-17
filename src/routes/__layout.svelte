<script lang="ts">
    import Web3Wrapper from '@chiuzon/svelteweb3/Web3Wrapper.svelte'
    import { ethers } from 'ethers'

    const fetchLibrary = (provider: any) => {
        const _provider = new ethers.providers.Web3Provider(provider)
        _provider.pollingInterval = 1000
        return _provider
    }
</script>


<Web3Wrapper fetchLibrary={fetchLibrary}>
    <slot />
</Web3Wrapper>


<style global>
    button {
        padding: 5px 5px;
    }

    input {
        padding: 5px 5px;
        border-radius: 5px;
    }

    .connect-box {
        font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>