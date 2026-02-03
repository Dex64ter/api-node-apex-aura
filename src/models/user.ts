export default class User {
  id: number;
  name: string;
  email: string;
  password: string;

  private static uuid = 1;
  
  constructor(name: string, email: string, password: string) {
    this.id = User.uuid++;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}