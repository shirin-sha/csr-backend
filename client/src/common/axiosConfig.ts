import axios from "axios";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import Login from "src/pages/Authentication/Login";
import { AuthContext } from "src/store/auth/context";

export const axiosApi = (url: string, data: any) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token") || "";
    
    axios
      .post(url, data, {
        headers: {
          token: token,
        },
      })
      .then((response: any) => {
        resolve(response);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          console.log();
          console.log("auth error");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        console.log(err);
        reject(err);
      });
  });
};

export const axiosDoc = (file: any) => {
  return new Promise((resolve, reject) => {
    console.log({ file });

    axios({
      url: "/admin/document-view",
      data: { file },
      method: "POST",
      responseType: "blob", // Important,
      headers: { token: localStorage.getItem("token") || "" },
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          console.log();
          console.log("auth error");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        console.error({ error });
      });
  });
};
