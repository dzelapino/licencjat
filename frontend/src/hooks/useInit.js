import { useEffect } from "react";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { useDispatch } from "react-redux";
import { setAuthorizedState, setId, setRoleState } from "slices/authSlice";
const issuer = process.env.ISSUER || "kkolodziejski"

const useInit = () => {

    const dispatch = useDispatch();
    
    useEffect(() => {
        try {
        const token = Cookies.get("appToken");
        const decoded = jwt_decode(token);
        if (decoded.iss === issuer) {
            dispatch(setAuthorizedState(decoded.sub.isAuthenticated));
            dispatch(setRoleState(decoded.sub.role));
            dispatch(setId(decoded.sub.id));
        }    
        } catch (error) {
          dispatch(setAuthorizedState(false));
          dispatch(setRoleState("public"));
          dispatch(setId(null));
        }
      }, [dispatch]);

}

export default useInit