import React, { useState } from 'react';

function SignupForm({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the user already exists
    const userExists = users.some(user => user.username === username);

    if (userExists) {
      setMessage('User already exists!');
    } else {
      const newUser = { username, password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      setMessage('Signup successful! You can now log in.');
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Sign Up</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignupForm;
