const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Returns one message per invalid field. An empty object means the form is valid.
export function validateContact({ name, email, message }) {
  const errors = {};
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (!cleanName) errors.name = "Enter your name.";
  else if (cleanName.length < 2) errors.name = "Your name needs at least 2 characters.";

  if (!cleanEmail) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(cleanEmail)) errors.email = "Enter an email address in the form name@example.com.";

  if (!cleanMessage) errors.message = "Write a message before sending.";
  else if (cleanMessage.length < 10) errors.message = "Your message needs at least 10 characters.";
  else if (cleanMessage.length > 2000) errors.message = "Keep your message under 2,000 characters.";

  return errors;
}
