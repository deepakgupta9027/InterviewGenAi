import {useState} from 'react'
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const {loading, handleRegister} = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    await handleRegister({username,email,password});
    navigate("/");
  }
  if(loading){
    return <main className="loading">Loading...</main>
  }
  return (
    <main className="auth-page">
      <div className="form-container">
        <h1>Join Us</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="username">Full Name</label>
            <input 
              onChange={(e) => setUsername(e.target.value)} 
              type="text" 
              id="username" 
              name="username" 
              placeholder='Your display name' 
              required
            />
          </div>
          <div className="input-group" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="email">Email Address</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              id="email" 
              name="email" 
              placeholder='name@example.com' 
              required
            />
          </div>
          <div className="input-group" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="password">Password</label>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              id="password" 
              name="password" 
              placeholder='Create a secure password' 
              required
            />
          </div>
          <button className='button primary-btn' type="submit">
            Create account
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}

export default Register
