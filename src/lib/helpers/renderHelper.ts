export function _if(condition, object){
    try{
        return condition ? object : ''
    }catch{
        return ''
    }
}