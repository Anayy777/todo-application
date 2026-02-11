import { useState , useEffect} from 'react'
import './App.css'
import api from './axios';

function App() {
  const [loggedIn , setLoggedIn] = useState(!!localStorage.getItem('token'));

  const [todo , setTodo] = useState([]);
  const [task , setTask] = useState('');
  const [username , setusername] = useState(localStorage.getItem('username') || "");
  const [authData , setauthData] = useState({name : '' , email : '' , password : ''});
  const [signUp , setsignUp] = useState(false);

  
  const fetchTodos = async()=> {
    try{
      const res = await api.get('/todos');
      setTodo(res.data.todo);
    }
    catch(err){
      console.error("Failed to fetch : " , err);
    }
  }
  
    useEffect(() => {
      if(loggedIn) fetchTodos();
    } , [loggedIn]);

  const handleAuth = async () => {
    try{
      const endPoint = signUp ? 'signUp' : 'signIn';

    const res = await api.post(endPoint , authData);

    if(!signUp){
      console.log(res.data.name);
      localStorage.setItem('token' , res.data.token);
      localStorage.setItem('username' , res.data.name);
      setLoggedIn(true)
      setusername(res.data.name);
    }
    else{
      alert("Signup Successful! Continue to login");
      setsignUp(false);
    }
    }catch(err){
    alert(err.response?.data?.message || "Failed Auth"); // using ? to avoid app crashing incase response or data is undefined by throwing an error message    
  }

}

  const addtodo = async()=> {
    try{
        await api.post('/todo' , {todo : task , done : false});
        setTask("");
        fetchTodos();

    }catch(err){
      alert('There was a problem while creating Todo , please try again later');

    }
  }

    const logout= () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setLoggedIn(false);
      setTodo([]);
    }

    if(!loggedIn){
      return(
        <div style={{padding: '20px'}}>
            <h2>{signUp? "Sign Up" : "Sign In"}</h2>
            {signUp && <input placeholder='Enter your name' onChange={e => setauthData({...authData , name : e.target.value})}></input>}
            <input placeholder='Enter your email' onChange={e => setauthData({...authData , email : e.target.value})}></input>
            <input placeholder='Enter password' onChange={e => setauthData({...authData , password : e.target.value})}></input>
            <button onClick={handleAuth}>{signUp ? "SIGN UP" : "LOGIN"}</button>
            <p onClick={() => setsignUp(!signUp)} style={{cursor : 'pointer' , color : 'blue'}}>{signUp ? "Already have an account" : "Create a new Account"}</p>
        </div>
      )

      
    }

    return(
      <div>
        <h2>TODO LIST OF USER {username}  <button onClick={logout}>Logout</button></h2>

        <input value={task} onChange={e => setTask(e.target.value)} placeholder = 'Enter Your task'></input>

        <button onClick={addtodo}>Add Todo</button>
      
        <ul>
          {
            todo.map(e => (
              <li key={e._id}>
                {e.todo} {e.done ? "✅" : "⏳"}
              </li>
            ))
          }
        </ul>
      </div>
    )

  }

export default App
