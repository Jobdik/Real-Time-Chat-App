import { useState, useEffect, use } from 'react';
import styles from './App.module.css';
import ChatPage from './components/ChatPage/ChatPage';
import { API_URL } from './Utils/api';
import isTokenValid from './Utils/isTokenValid';

function App() {

  const [token, setToken] = useState(null);

  const [name, setName] = useState("");

  // Check if a token exists in localStorage and is still valid
  useEffect(()=>{
    const saved = localStorage.getItem("token");
    if(saved && !isTokenValid(saved)) {
      setToken(saved);
    }
    else {
      localStorage.removeItem("token");
      setToken(null);
    }
  },[]) 

  // Save the token
  const saveToken = (token) =>{
    localStorage.setItem("token", token);
    setToken(token);
  }

  // Sends the chosen name to the login endpoint to receive a JWT
  const join = async () => {
    try{
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({name})
      })
      const {token: jwt} = await response.json();
      saveToken(jwt);
    }
    catch(e){
      console.log("Login failed:", e); 
    }
  };


  // If no valid token in state, render the login form
  if(!token) {
    return (
      <div className={styles.container}>
        <div className={styles.title_wrapper}>
          <h2 className={styles.title}>Enter your name</h2>
        </div>
        <div className={styles.input_container}>
          <div className={styles.input_wrapper}>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <button className={styles.button} onClick={join}>Start chatting!</button>
        </div>
      </div>
    );
  }

  // If we have a valid token, render the ChatPage component
  return <ChatPage token={token} />
}

export default App;
