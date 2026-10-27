export interface AuthFormValues {
  email: string;
  password: string;
}

export interface AuthFormErrors {
  email: string | null;
  password: string | null;
}

export interface AuthFormTouched {
  email: boolean;
  password: boolean;
}
