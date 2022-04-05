const validateRequired = (value: any): string | null => {
  if (
    value === "" ||
    value === undefined ||
    value === null ||
    value?.length === 0
  ) {
    return "This field is required";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) {
    return null;
  } else if (email.length < 3) {
    return "Email must be at least 3 characters long";
  } else if (email.length > 64) {
    return "Email must be at most 64 characters long";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return "This address appears to be invalid";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return null;
  } else if (password.length < 7) {
    return "Password must contain at least 7 characters";
  }
  return null;
};

const validatePassword2 = (
  password: string,
  password2: string
): string | null => {
  if ((password || password2) && password !== password2) {
    return "Passwords do not match";
  }
  return null;
};

const validateUserName = (username: string): string | null => {
  if (!username) {
    return null;
  } else if (username.length < 2) {
    return "Username must be at least 2 characters long";
  } else if (username.length > 26) {
    return "Username must be at most 26 characters long";
  } else if (!/[A-Z0-9]/i.test(username)) {
    return "Username must contain at least one alphanumeric letter.";
  } else if (!/^[A-Z0-9!@#$%^&*()_+={}[\]:";',.-]+$/i.test(username)) {
    return "Username can only contain alphanumeric letters and the following special characters: ! @ # $ % ^ & * ( ) _ - + = { } [ ] : \" ; ' , .";
  }
  return null;
};

export {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePassword2,
  validateUserName,
};
