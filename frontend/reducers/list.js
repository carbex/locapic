export default function(list = [], action) {
    if(action.type === 'saveList') { 
        let newList = [...list, action.list] 
        return newList
    } else  if(action.type === 'deleteItemFromList') {
        let newList = [...list]
        newList.splice(action.index, 1)
        return newList
    } else{
        return list
    }
}