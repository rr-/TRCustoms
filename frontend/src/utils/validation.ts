import { isString } from "lodash";

const getURLRegexp = () => {
  const ul = "\u00a1-\uffff";
  const ipv4 =
    "(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}";
  const ipv6 = "\\[[0-9a-f:.]+\\]";
  const hostname =
    "[a-z" + ul + "0-9](?:[a-z" + ul + "0-9-]{0,61}[a-z" + ul + "0-9])?";
  const domain = "(?:\\.(?!-)[a-z" + ul + "0-9-]{1,63})*";
  const tld = "\\.(?!-)(?:[a-z" + ul + "-]{2,63}|xn--[a-z0-9]{1,59})\\.?";
  const host = "(" + hostname + domain + tld + "|localhost)";

  const schemes = ["http", "https", "ftp", "ftps"];
  return new RegExp(
    "^(?:" +
      schemes.join("|") +
      ")://" +
      "(?:[^\\s:@/]+(?::[^\\s:@/]*)?@)?" +
      "(?:" +
      ipv4 +
      "|" +
      ipv6 +
      "|" +
      host +
      ")" +
      "(?::\\d{2,5})?" +
      "(?:[/?#][^\\s]*)?" +
      "$",
    "i",
  );
};

const URLRegex = getURLRegexp();

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

const validateMaxLength = (maxLength: number) => {
  const validateFunc = (value: any): string | null => {
    if (isString(value) && value.length > maxLength) {
      return `This field must be at most ${maxLength} characters long`;
    }
    return null;
  };
  return validateFunc;
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

const validateURL = (url: string): string | null => {
  if (!url) {
    return null;
  }

  if (!url.match(URLRegex)) {
    return 'Enter a valid URL, like "https://example.com/"';
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
  password2: string,
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
  validateMaxLength,
  validateEmail,
  validatePassword,
  validatePassword2,
  validateUserName,
  validateURL,
};
