export interface UserSchema {
  _id: string;
  username: string;
  roles: string[];
  tasks: string[]; // nao implementado
  unavailableStartTime?: Date[];
  unavailableEndTime?: Date[];
}
