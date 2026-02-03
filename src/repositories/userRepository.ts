import User from "../models/user";

const customers: User[] = [];

export function createCustomer(user: User) {
  customers.push(user);
}