export type PasswordRule = {
  id: string;
  label: string;
  valid: boolean;
};

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    { id: "length", label: "Mínimo de 8 caracteres", valid: password.length >= 8 },
    { id: "uppercase", label: "Uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { id: "lowercase", label: "Uma letra minúscula", valid: /[a-z]/.test(password) },
    { id: "number", label: "Um número", valid: /\d/.test(password) },
    { id: "special", label: "Um caractere especial", valid: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return getPasswordRules(password).every((rule) => rule.valid);
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return confirmPassword.length > 0 && password === confirmPassword;
}
