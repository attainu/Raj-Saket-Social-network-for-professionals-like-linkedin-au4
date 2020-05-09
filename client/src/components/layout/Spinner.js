import React, { Fragment } from "react";
// import spinner from "./spinner.gif";

export default () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="https://media.giphy.com/media/y1ZBcOGOOtlpC/200.gif"
        style={{ width: "200px", margin: "25px", display: "block" }}
        alt="Loading..."
      />
    </div>
  );
};
