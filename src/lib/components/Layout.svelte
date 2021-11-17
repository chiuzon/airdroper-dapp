<script lang="ts">
    import ConnectButton from "./ConnectButton.svelte";
</script>


<nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item logo" href="/">
        Airdrop on Telos
      </a>
  
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
  
    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        
      </div>
  
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  </nav>

<div class="container">
    <slot />
</div>


<style>
    .logo {
        font-weight: 900;
        color: rgb(0, 132, 255);
    }
</style>