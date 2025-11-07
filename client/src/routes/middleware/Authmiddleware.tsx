import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";


interface AuthLayoutProps {
  component: any;
  layout: any;
  isAuthProtected: any;
  path?: string;
  exact?: boolean;
  key?: number;
  location?:any;
}

const Authmiddleware = ({
  component,
  layout,
  isAuthProtected,
  path,
  exact,
  key,
  location,
  ...rest
}: AuthLayoutProps) => {
  const Layout = layout;
  const Component = component;
  


  return (
    <Route
      {...rest}
      render={props => {
        if (isAuthProtected && !localStorage.getItem("token") ) {
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
        }

        return (
          <Layout>
            <Component {...props} />
          </Layout>
        );
      }}
    />
  );
};

export default Authmiddleware;
