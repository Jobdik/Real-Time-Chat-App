import { useState, useEffect } from 'react';
import styles from './App.module.css';
import ChatPage from './components/ChatPage/ChatPage';
import { API_URL } from './Utils/api';

const SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const [username, setUserName] = useState(null);

  const [name, setName] = useState("");
 

  // Check if a token exists in localStorage and is still valid
  useEffect(()=>{
    async function checkToken(){
      try{
        const res = await fetch(`${SERVER_URL}/auth`,{
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if(data.auth){
          setIsAuth(true);
          setUserName(data.username);
        }else{
          setIsAuth(false);
        }
      }catch(err){
        console.log("Error checking token:", err);
        setIsAuth(false);
      }
      finally{
        setAuthChecked(true);
      }
    }
    checkToken();
  },[])   

  if(!authChecked){
    return(
      <div>Loading...</div>
    )
  }

  // Sends the chosen name to the login endpoint to receive a JWT
  const join = async () => {
    if(!name.trim()){
      alert("Please enter a name.");
      return;
    };
    try{
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({name})
      })

      if(response.ok){
        setIsAuth(true);
      }else{
        const error = await response.json();
        alert("Login failed: " + error.message);
      }
      
    }
    catch(e){
      console.log("Login failed:", e); 
    }
  };


  if(!isAuth){
    return (
      <div className={styles.container}>
        <div className={styles.title_wrapper}>
          <h2 className={styles.title}>Chat App</h2>
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

  // If no valid token in state, render the login form


  // If we have a valid token, render the ChatPage component
  return <ChatPage username={username} />
}

export default App;
