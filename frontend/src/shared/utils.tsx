const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Required";
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
    return "Required";
  } else if (password.length < 7) {
    return "Password must contain at least 7 characters";
  }
  return null;
};

const validateUserName = (username: string): string | null => {
  if (!username) {
    return "Required";
  } else if (username.length < 3) {
    return "Username must be at least 3 characters long";
  } else if (username.length > 26) {
    return "Username must be at most 26 characters long";
  } else if (!/^[A-Z0-9._+-]+$/i.test(username)) {
    return "Username can only contain alphanumeric letters and the following special characters: . _ + -";
  }
  return null;
};

const makeSentence = (input: string): string => {
  return input[0].toUpperCase() + input.substr(1).replace(/\.$/, "") + ".";
};

const formatDateTime = (input: string | null): string | null => {
  if (!input) {
    return null;
  }
  const date = new Date(input);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const filterFalsyObjectValues = <T extends Object>(source: T): T => {
  return Object.fromEntries(
    Object.entries(source).filter(([_key, value]) => !!value)
  ) as T;
};

export {
  validateEmail,
  validatePassword,
  validateUserName,
  makeSentence,
  formatDateTime,
  filterFalsyObjectValues,
};
