import { useEffect } from "react";
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
  const passwordLengthSatisfied = value.length >= 12;
  const hasCapitalLetter = value !== value.toLowerCase();
  const hasLowercaseLetter = value !== value.toUpperCase();
  const hasNumericalChar = /\d/.test(value);
  const hasSpecialCharacter = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(
    value
  );

  const matchedAllRequirements =
    passwordLengthSatisfied &&
    hasCapitalLetter &&
    hasLowercaseLetter &&
    hasNumericalChar &&
    hasSpecialCharacter;

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(matchedAllRequirements);
    }
  }, [matchedAllRequirements, onValidityChange]);

  return (
    <Form.Group className={className || ""}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="password"
        placeholder={placeholder}
        value={value}
        isInvalid={Boolean(value) && !matchedAllRequirements}
        isValid={matchedAllRequirements}
        onChange={(e) => onChange(e.target.value)}
      />
      {!value ? null : matchedAllRequirements ? (
        <Form.Control.Feedback>
          <CheckIcon /> Looks good. I hope it's not your pet's name!
        </Form.Control.Feedback>
      ) : (
        <>
          <Form.Text
            className={`d-block text-${
              passwordLengthSatisfied ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {passwordLengthSatisfied ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should be at least 12 characters
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasCapitalLetter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasCapitalLetter ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 capital letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasLowercaseLetter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasLowercaseLetter ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 lowercase letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasNumericalChar ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasNumericalChar ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 numerical character
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              hasSpecialCharacter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {hasSpecialCharacter ? <CheckIcon /> : <CrossIcon />}
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
