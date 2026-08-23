export function validateEmail(value) {
    if (!value) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address";
    }
    return "";
  }
export function validatePassword(value) {
    if (!value) {
      return "Password is required";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value)) {
      return "Enter a valid password";
    }
    return "";
  }
export function validateLoginPassword(password) {
  if (!password) return "Password is required";
  return "";
}