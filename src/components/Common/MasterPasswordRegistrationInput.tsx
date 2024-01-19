import Form from "react-bootstrap/Form";
import { CheckIcon, CrossIcon } from "./Icons";

function MasterPasswordRegistrationInput({
  className,
  label,
  placeholder,
  value,
  formText,
  onChange,
  onValidityChange,
}: {
  className?: string;
  label: string;
  placeholder: string;
  value: string;
  formText?: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
}) {
  const passwordLengthSatisfied = (v: string) => v.length >= 12;
  const hasCapitalLetter = (v: string) => v !== v.toLowerCase();
  const hasLowercaseLetter = (v: string) => v !== v.toUpperCase();
  const hasNumericalChar = (v: string) => /\d/.test(v);
  const hasSpecialCharacter = (v: string) =>
    /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(v);

  const matchedAllRequirements = (v: string) =>
    passwordLengthSatisfied(v) &&
    hasCapitalLetter(v) &&
    hasLowercaseLetter(v) &&
    hasNumericalChar(v) &&
    hasSpecialCharacter(v);

  const handleOnChange = (newValue: string) => {
    const hasValidityChanged =
      matchedAllRequirements(value) !== matchedAllRequirements(newValue);
    onChange(newValue);
    if (hasValidityChanged && onValidityChange) {
      onValidityChange(matchedAllRequirements(newValue));
    }
  };

  return (
    <Form.Group className={className || ""}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="password"
        placeholder={placeholder}
        value={value}
        isInvalid={Boolean(value) && !matchedAllRequirements(value)}
        isValid={matchedAllRequirements(value)}
        onChange={(e) => handleOnChange(e.target.value)}
      />
      {!value ? null : matchedAllRequirements(value) ? (
        <Form.Control.Feedback>
          <CheckIcon /> Looks good. I hope it's not your pet's name!
        </Form.Control.Feedback>
      ) : (
        <>
          <Form.Text
            className={`d-block text-${
              passwordLengthSatisfied(value) ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {passwordLengthSatisfied(value) ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should be at least 12 characters
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasCapitalLetter(value) ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasCapitalLetter(value) ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 capital letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasLowercaseLetter(value) ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasLowercaseLetter(value) ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 lowercase letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasNumericalChar(value) ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasNumericalChar(value) ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 numerical character
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasSpecialCharacter(value) ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasSpecialCharacter(value) ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 specialcase character
          </Form.Text>
        </>
      )}
      {formText && <Form.Text className="text-muted">{formText}</Form.Text>}
    </Form.Group>
  );
}

export default MasterPasswordRegistrationInput;
