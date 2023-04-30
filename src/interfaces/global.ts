export interface RegisterObject {
  first_name: string;
  last_name: string;
  email: string;
  user_name: string;
  password: string;
  group: string[];
  permission: string;
}

export interface LoginObject {
  email: string;
  password: string;
}
