import { useEffect, useState } from "react";
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
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validation, setValidation] = useState({
    passwordLengthSatisfied: false,
    hasCapitalLetter: false,
    hasLowercaseLetter: false,
    hasNumericalChar: false,
    hasSpecialCharacter: false,
  });
  const [isPassValid, setIsPassValid] = useState(false);
  const passwordLengthSatisfied = (v: string) => v.length >= 12;
  const hasCapitalLetter = (v: string) => v !== v.toLowerCase();
  const hasLowercaseLetter = (v: string) => v !== v.toUpperCase();
  const hasNumericalChar = (v: string) => /\d/.test(v);
  const hasSpecialCharacter = (v: string) =>
    /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(v);

  const validatePasswordRequirements = (v: string) => {
    return {
      passwordLengthSatisfied: passwordLengthSatisfied(v),
      hasCapitalLetter: hasCapitalLetter(v),
      hasLowercaseLetter: hasLowercaseLetter(v),
      hasNumericalChar: hasNumericalChar(v),
      hasSpecialCharacter: hasSpecialCharacter(v),
    };
  };

  const hasPassedAllValidation = (val: { [k: string]: boolean }) => {
    for (let k of Object.keys(val)) {
      if (!val[k]) {
        return false;
      }
    }
    return true;
  };

  const handleOnChange = (newValue: string) => {
    const oldPassVal = validatePasswordRequirements(value);
    const newPassVal = validatePasswordRequirements(newValue);
    const isOldValueValid = hasPassedAllValidation(oldPassVal);
    const isNewValueValid = hasPassedAllValidation(newPassVal);
    setValidation(newPassVal);
    setIsPassValid(isNewValueValid);
    const hasValidityChanged = isOldValueValid !== isNewValueValid;
    onChange(newValue);
    if (hasValidityChanged && onValidityChange) {
      onValidityChange(isNewValueValid);
    }
  };

  useEffect(() => {
    const onKeyChange = (event: KeyboardEvent) => {
      setIsCapsLockOn((state) => event.getModifierState?.("CapsLock") ?? state);
    };

    document.addEventListener("keydown", onKeyChange);
    document.addEventListener("keyup", onKeyChange);
    return () => {
      document.removeEventListener("keydown", onKeyChange);
      document.removeEventListener("keyup", onKeyChange);
    };
  }, []);

  return (
    <Form.Group className={className || ""}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="password"
        placeholder={placeholder}
        value={value}
        isInvalid={Boolean(value) && !isPassValid}
        isValid={isPassValid}
        onChange={(e) => handleOnChange(e.target.value)}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      />
      {isCapsLockOn && isFocused && (
        <Form.Text className="d-block mb-3">CapsLock is on</Form.Text>
      )}
      {!value ? null : isPassValid ? (
        <Form.Control.Feedback>
          <CheckIcon /> Looks good. Make sure it's not easily guessable!
        </Form.Control.Feedback>
      ) : (
        <>
          <Form.Text
            className={`d-block text-${
              validation.passwordLengthSatisfied ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {validation.passwordLengthSatisfied ? (
                <CheckIcon />
              ) : (
                <CrossIcon />
              )}
            </span>{" "}
            Should be at least 12 characters
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              validation.hasCapitalLetter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {validation.hasCapitalLetter ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 capital letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              validation.hasLowercaseLetter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {validation.hasLowercaseLetter ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 lowercase letter
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              validation.hasNumericalChar ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {validation.hasNumericalChar ? <CheckIcon /> : <CrossIcon />}
            </span>{" "}
            Should contain at least 1 numerical character
          </Form.Text>
          <Form.Text
            className={`d-block text-${
              validation.hasSpecialCharacter ? "success" : "danger"
            }`}
          >
            <span className="me-3">
              {validation.hasSpecialCharacter ? <CheckIcon /> : <CrossIcon />}
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
