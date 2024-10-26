import "./Login.css";
import { assets } from "../../assets/assets";
import { useState } from "react";
import { signup, login, resetPass } from "../../config/firebase";
import { FaRegEye, FaLink, FaRegEyeSlash } from "react-icons/fa";

export default function Login() {
  const [currState, setCurrState] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);


  const pass = document.getElementsByClassName('pass')[0];

  const onSubmitHandler = (event) => {
    if (currState === "Sign Up") {
      signup(username, email, password);
    } else if (currState === "Login") {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <img src={assets.chad} className="logo" alt="Chat Logo" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitHandler(e);
        }}
        className="login-form"
        id="login-form"
      >
        <h2>{currState}</h2>
        {currState === "Sign Up" ? (
          <input
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="form-input"
            required
          />
        ) : null}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="form-input"
          required
        />
        <div className="form-input pass-div">
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="pass"
            required
            />
            <div className="pass-icon">
                {
                    
                    seePassword ?
                    <FaRegEyeSlash onClick={() =>{ 
                        setSeePassword(prev=>!prev)
                        pass.type = 'password';
                    }}/> :
                    <FaRegEye onClick={() =>{ 
                        setSeePassword(prev=>!prev)
                        pass.type = 'text';
                    }}/>
                }
                
            </div>
        </div>
        
        
        {currState === "Sign Up" ? (
          <div className="login-term">
            <input type="checkbox" name="checkbox-inp" required />
            <p>
              <em>I agree to the terms of use & privacy policy</em>
            </p>
          </div>
        ) : null}
        <button type="submit" className="signup-btn">
          <span>
            {currState === "Sign Up" ? "Create an account" : "Login Now"}
          </span>
        </button>
        <div className="login-forgot">
          <p className="login-toggle">
            {currState === "Sign Up" ? "Already have an account?" : "Sign Up?"}{" "}
            <span
              onClick={() => {
                setCurrState((prev) =>
                  prev === "Sign Up" ? "Login" : "Sign Up"
                );
              }}
            >
              {currState === "Sign Up" ? "Login Here" : "Click Here"}{" "}
              <FaLink color="rgb(12, 132, 201)" />
            </span>
          </p>
          {currState === 'Login' ? <p className="login-toggle">Forgot Password? <span onClick={()=>resetPass(email)}>Reset Here</span></p> : null}
        </div>
      </form>
    </div>
  );
}
