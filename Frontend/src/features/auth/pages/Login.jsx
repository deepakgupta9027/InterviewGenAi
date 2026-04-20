import {useState} from 'react'
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';

const Login = () => {
  const {loading, handleLogin} = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    await handleLogin({email,password});
    navigate("/");
  }
  if(loading){
    return <main className="loading">Loading...</main>
  }
  return (
    <main className="auth-page">
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ animationDelay: '0.1s' }}>
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
          <div className="input-group" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password">Password</label>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              id="password" 
              name="password" 
              placeholder='Min. 8 characters' 
              required
            />
          </div>
          <button className='button primary-btn' type="submit">
            Continue
          </button>
        </form>
        <p>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  )
}

export default Login
