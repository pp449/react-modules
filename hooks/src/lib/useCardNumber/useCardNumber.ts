import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from "react";
import Validator from "../utils/validator";
import { ERROR_MESSAGE, REGEX } from "../constants";
import getCardBrand from "../utils/getCardBrand";
import useInput from "../common/useInput";
import getCardNumberMaxLength from "../utils/getCardNumberMaxLength";
import formattingCardNumber from "../utils/formattingCardNumber";

const useCardNumber = (initialValue: string) => {
  const { inputValue, updateByNameAndValue } = useInput(initialValue);

  const [brandType, setBrandType] = useState<BrandType>("Normal");
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errorMessage: "",
  });

  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const assignCardBrandFromNumber = (cardNumber: string) => {
    const cardBrand = getCardBrand(cardNumber);
    if (brandType === cardBrand) return;

    setBrandType(cardBrand);
  };

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target !== e.currentTarget) return;

    const { value, selectionStart } = e.target;
    const valueWithoutSpace = value.replace(REGEX.space, "");

    if (!Validator.checkDigit(valueWithoutSpace)) {
      return setValidationResult({
        isValid: false,
        errorMessage: ERROR_MESSAGE.onlyNumber,
      });
    }

    if (Validator.checkOverMaxDigit(valueWithoutSpace, getCardNumberMaxLength(brandType))) {
      return setValidationResult({
        isValid: false,
        errorMessage: ERROR_MESSAGE.cardNumberOutOfRange,
      });
    }

    assignCardBrandFromNumber(valueWithoutSpace);
    setValidationResult({
      isValid: true,
      errorMessage: "",
    });

    const formattedValue = formattingCardNumber(valueWithoutSpace);
    updateByNameAndValue(formattedValue);

    setCursorPosition(selectionStart);
  };

  const handleCardNumberBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (e.target !== e.currentTarget) return;

    const { value } = e.target;
    const valueWithoutSpace = value.replace(REGEX.space, "");

    if (!Validator.checkFillNumber(valueWithoutSpace, getCardNumberMaxLength(brandType)))
      return setValidationResult({
        isValid: false,
        errorMessage: ERROR_MESSAGE.cardNumberOutOfRange,
      });

    setValidationResult({
      isValid: true,
      errorMessage: "",
    });
  };

  useEffect(() => {
    if (cursorPosition === null || !inputRef.current) return;

    const input = inputRef.current;
    const formattedValue = inputValue;

    if (formattedValue[cursorPosition - 1] === " ") {
      const newCursorPosition =
        formattedValue.length > input.value.length ? cursorPosition + 1 : cursorPosition - 1;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    } else {
      input.setSelectionRange(cursorPosition, cursorPosition);
    }

    setCursorPosition(null);
  }, [inputValue, cursorPosition]);

  return {
    inputValue,
    validationResult,
    brandType,
    handleCardNumberChange,
    handleCardNumberBlur,
    inputRef,
  } as const;
};

export default useCardNumber;
