import { writable } from "svelte/store";


export function errorStore() {
    const error = writable("")

    function onError(message: string){
        error.set(message)
    }

    return {
        error,
        onError
    }
}
