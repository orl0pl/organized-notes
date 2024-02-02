import React, { useState, useEffect, FormEvent } from 'react';
import User from '../../interfaces/user';
import styles from "@/styles/Home.module.css";
import { Roboto } from 'next/font/google';
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    id: 0,
    nazwa: '',
    login: '',
    haslo: '',
    salt: '',
    tworzenieFolderu: false,
    edytowanieFolderow: false,
    dodawanieNotatek: false,
    edytowanieCudzychNotatek: false,
    dodawanieMultimediów: false,
    edytowanieCudzychMultimediów: false,
    administrator: false,
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/hello');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({
          id: 0,
          nazwa: '',
          login: '',
          haslo: '',
          tworzenieFolderu: false,
          edytowanieFolderow: false,
          dodawanieNotatek: false,
          edytowanieCudzychNotatek: false,
          dodawanieMultimediów: false,
          edytowanieCudzychMultimediów: false,
          administrator: false,
        });
        fetchUsers(); // Odśwież listę po dodaniu użytkownika
      } else {
        console.error('Error adding user:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch('/api/hello', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchUsers(); // Odśwież listę po usunięciu użytkownika
      } else {
        console.error('Error deleting user:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div style={roboto.style}>
      <h1>User Management</h1>
      <ul>
        {users.map ? users.map((user) => (
          <li key={user.id}>
            {user.nazwa} - {user.login}{' '}
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        )) : "Coś poszło nie tak"}
      </ul>

      <pre>
        {JSON.stringify(users, null, 2)}
      </pre>

      <h2>Add New User</h2>
      <input
        type="text"
        placeholder="Name"
        value={newUser.nazwa}
        onChange={(e) => setNewUser({ ...newUser, nazwa: e.target.value })}
      /><br/>
      <input
        type="text"
        placeholder="Login"
        value={newUser.login}
        onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
      />
      <br/>
      <input type="password" name="haslo" id="haslo" placeholder="Password"  onChange={(e)=>setNewUser({...newUser, haslo: e.target.value})}/>
      <br/>
      Permissions <br />
      Creating folder: <input type="checkbox" checked={newUser.tworzenieFolderu} onChange={(e)=>setNewUser({...newUser, tworzenieFolderu: e.target.checked})} /> <br />
      Editing folder: <input type="checkbox" checked={newUser.edytowanieFolderow} onChange={(e)=>setNewUser({...newUser, edytowanieFolderow: e.target.checked})} /> <br />
      Editing notes of other people: <input type="checkbox" checked={newUser.edytowanieCudzychNotatek} onChange={(e)=>setNewUser({...newUser, edytowanieCudzychNotatek: e.target.checked})} /> <br />
      Adding multimedia: <input type="checkbox" value={newUser.dodawanieMultimediów ? "on" : "off"} onChange={(e)=>setNewUser({...newUser, dodawanieMultimediów: e.target.checked})} /> <br />
      Editing multimedia of other people: <input type="checkbox" value={newUser.edytowanieCudzychMultimediów ? "on" : "off"} onChange={(e)=>setNewUser({...newUser, edytowanieCudzychMultimediów: e.target.checked})} /> <br />
      Admin: <input type="checkbox" checked={newUser.administrator} onChange={(e)=>setNewUser({...newUser, administrator: e.target.checked})} /> <br />
      

      <pre>
      {JSON.stringify(newUser, null, 2)}
      </pre>
      
      

      
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default UserManagement;
