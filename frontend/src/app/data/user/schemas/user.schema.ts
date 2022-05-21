export interface UserSchema {
  _id: string;
  username: string;
  roles: string[];
  tasks: string[];
  unavailableTimes: {startDate: Date, endDate: Date}[];
}
