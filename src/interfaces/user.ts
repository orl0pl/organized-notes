interface User {
    id: number;
    nazwa: string;
    login: string;
    haslo: string;
    salt: string;
    tworzenieFolderu: boolean;
    edytowanieFolderow: boolean;
    dodawanieNotatek: boolean;
    edytowanieCudzychNotatek: boolean;
    dodawanieMultimediów: boolean;
    edytowanieCudzychMultimediów: boolean;
    administrator: boolean;
  }
  
  export default User;