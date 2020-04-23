// here we'll write a function that will take in a token
// if the token is there it's going to add it to the headers if not it's gonna delete it from the header

import axios from "axios";

// we are adding a global header(not making a request)

const setAuthToken = (token) => {
  // here token is gonna come from local storage
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
