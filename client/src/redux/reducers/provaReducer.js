const initialState = false
const ProvaReducer = (state =initialState, action) => {

    switch (action.type) {
        case 'SUMAR':
            return  action.payload
   


        default:
            return state;
    }

 
}

export default ProvaReducer