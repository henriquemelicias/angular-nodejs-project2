export interface TeamSchema {
  _id: string;
  name: string;
  members: string[];
  projectAcronym?: string | null;
}