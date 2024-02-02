import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, haslo }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login here, e.g., redirect to dashboard or store token
        console.log(data.message); // Placeholder for successful login handling
      } else {
        setError(data.message || 'An error occurred during login.');
      }
    } catch (error) {
      setError('An error occurred during login.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login">Login:</label>
          <input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="haslo">Hasło:</label>
          <input
            id="haslo"
            type="password"
            value={haslo}
            onChange={(e) => setHaslo(e.target.value)}
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  );
};

export default LoginPage;
