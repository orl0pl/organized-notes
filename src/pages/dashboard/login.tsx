import Button from '@/components/button';
import { Input } from '@/components/input';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const LoginPage: React.FC = () => {
  const [login, setLogin] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError]  = useState('');
  const {theme, setTheme } = useTheme()
  const {query} = useRouter()

  useEffect(()=>{
    if(!theme){
      setTheme('green-light')
    }
    if(localStorage){
      if(!localStorage.getItem('theme')){
        setTheme('green-light')
      }
    }
  })

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

        // Redirect
        if(query.redirect){
          window.location.href = query.redirect as string
        }
      } else {
        setError(data.message || 'An error occurred during login.');
      }
    } catch (error) {
      setError('An error occurred during login.');
    }
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', flex: 1, width: '100vw'}}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
          <Input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder='Login'
          />
        <br />
          <Input
            id="haslo"
            type="password"
            value={haslo}
            placeholder='Password'
            onChange={(e) => setHaslo(e.target.value)}
          />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <br />
        <Button displayType='filled' type="submit">Zaloguj się</Button>
      </form>
    </div>
  );
};

export default LoginPage;
