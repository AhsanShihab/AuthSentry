import Button from "react-bootstrap/Button";
import { CheckIcon, CopyButtonIcon } from "./Icons";
import { useState } from "react";

export default function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copyBtnType, setCopyBtnType] = useState<"Copy" | "Copied">("Copy");

  const handleClickOnPasswordCopy = () => {
    navigator.clipboard.writeText(value);
    setCopyBtnType("Copied");
    setTimeout(() => setCopyBtnType("Copy"), 5000);
  };

  return (
    <Button
      className={className || ""}
      variant="outline-secondary"
      size="sm"
      onClick={handleClickOnPasswordCopy}
    >
      {copyBtnType === "Copied" ? <CheckIcon /> : <CopyButtonIcon />}
    </Button>
  );
}
