import { InjectedConnector } from '@web3-react/injected-connector'


export const injectedConnector = new InjectedConnector({
    //You can specify what chains you want to support
    supportedChainIds: [40]
})