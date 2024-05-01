import Form from "react-bootstrap/Form";
import { ExclaimationIcon } from "./Icons";

function EncryptionSecretInput({
  className = "",
  label,
  value,
  placeholder = "",
  onChange,
  showValidation = false,
  onValidationChange,
  children,
}: {
  className?: string;
  showValidation: boolean;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  const isValid = (v: string) => Boolean(v) && v.length >= 10;

  const handleOnChange = (newValue: string) => {
    let validityChanged = isValid(newValue) !== isValid(value);
    onChange(newValue);
    if (validityChanged && onValidationChange) {
      onValidationChange(isValid(newValue));
    }
  };

  return (
    <Form.Group className={className}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Text className="d-block text-warning mb-1 fw-semibold">
        <ExclaimationIcon /> Watch out! This is a plain text input field. Make
        sure no one is watching!
      </Form.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleOnChange(e.target.value)}
        isInvalid={showValidation && Boolean(value) && value.length < 20}
      />
      {showValidation && (
        <Form.Control.Feedback type="invalid">
          Need to be at least 20 characters long. The longer the better.
        </Form.Control.Feedback>
      )}
      {children}
    </Form.Group>
  );
}

export default EncryptionSecretInput;
