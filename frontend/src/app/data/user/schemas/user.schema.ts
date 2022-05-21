export interface UserSchema {
  _id: string;
  username: string;
  roles: string[];
  tasks: string[];
  unavailableStartTimes: Date[];
  unavailableEndTimes: Date[];
}
