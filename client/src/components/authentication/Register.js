import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import PropTypes from "prop-types";

//bringing action here
import { setAlert } from "../../actions/alert";

const Register = (props) => {
  //console.log("props-", props.setAlert);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const { name, email, password, confirm_password } = formData;

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    //console.log("state->", formData);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm_password) {
      props.setAlert("password does not match", "danger");
    } else {
      console.log("password matched->", formData);
      //   const newUser = { name, email, password };

      //   try {
      //     const config = {
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //     };

      //     const body = JSON.stringify(newUser);
      //     const res = await axios.post("/users", body, config);
      //     console.log("res->", res);
      //   } catch (error) {
      //     console.log(error);
      //   }
    }
  };

  return (
    <div className="container">
      <h1 className="large text-primary" style={{ textAlign: "center" }}>
        Sign Up
      </h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => handleInput(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => handleInput(e)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => handleInput(e)}
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm_password">Confirm password:</label>
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirm_password"
            value={confirm_password}
            onChange={(e) => handleInput(e)}
            minLength="6"
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
};

export default connect(null, { setAlert })(Register);
