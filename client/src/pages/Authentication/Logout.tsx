import React, { useEffect } from "react";
import { useHistory, withRouter } from "react-router-dom";

import { logoutUser } from "../../store/actions";

//redux
import { useDispatch } from "react-redux";


const Logout = () => {
 const history= useHistory()

  useEffect(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    history.push('/login')
  }, []);

  return <></>;
};

export default withRouter(Logout);
