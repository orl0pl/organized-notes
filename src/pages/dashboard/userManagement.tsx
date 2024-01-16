import React, { useState, useEffect } from 'react';
import User from '../../interfaces/user';

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
          salt: '',
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
    <div>
      <h1>User Management</h1>
      <ul>
        {users.map ? users.map((user) => (
          <li key={user.id}>
            {user.nazwa} - {user.login}{' '}
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        )) : "Coś poszło nie tak"}
      </ul>

      <h2>Add New User</h2>
      <input
        type="text"
        placeholder="Name"
        value={newUser.nazwa}
        onChange={(e) => setNewUser({ ...newUser, nazwa: e.target.value })}
      />
      {/* Dodaj pozostałe pola dla nowego użytkownika */}
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default UserManagement;
