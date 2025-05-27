import { jwtDecode } from "jwt-decode";


// Check if the token is still valid
function isTokenValid(token){
    try{
        const {exp} = jwtDecode(token);
        return exp > Date.now();
    } catch{
        return false;
    }
}

export default isTokenValid;