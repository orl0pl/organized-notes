// components/UserForm.tsx
import React, { useState } from 'react';
import User from '../interfaces/user';
import { Roboto } from 'next/font/google';



interface UserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
  user?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onSave, onCancel, user }) => {
  const [editedUser, setEditedUser] = useState<User>(user || getDefaultUser());

  function getDefaultUser(): User {
    return {
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
    };
  }

  const handleSave = () => {
    onSave(editedUser);
  };

  return (
    <div >
      <h2>{user ? 'Edit User' : 'Add New User'}</h2>
      <label>Name:</label>
      <input
        type="text"
        value={editedUser.nazwa}
        onChange={(e) => setEditedUser({ ...editedUser, nazwa: e.target.value })}
      />
      {/* Dodaj pozostałe pola dla użytkownika */}
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default UserForm;
