const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return "This address appears to be invalid";
  }
  return null;
};
const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Required";
  } else if (password.length < 7) {
    return "Password must contain at least 7 characters";
  }
  return null;
};

const validateUserName = (username: string): string | null => {
  if (!username) {
    return "Required";
  } else if (username.length < 2) {
    return "Username must be at least 2 characters long";
  } else if (!/^[A-Z0-9._+-]+$/i.test(username)) {
    return "Username can only contain alphanumeric letters and the following special characters: . _ + -";
  }
  return null;
};

const makeSentence = (input: string): string => {
  return input[0].toUpperCase() + input.substr(1).replace(/\.$/, "") + ".";
};

export { validateEmail, validatePassword, validateUserName, makeSentence };
