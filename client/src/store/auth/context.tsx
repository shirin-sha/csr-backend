import React,{createContext,useState} from 'react';

export const AuthContext=createContext<any>(true)
export default function Context({ children }:any) {
    const [expired, setExpired] = useState(true);
  
    return <AuthContext.Provider value={{expired,setExpired}}>{children}</AuthContext.Provider>;
  }
