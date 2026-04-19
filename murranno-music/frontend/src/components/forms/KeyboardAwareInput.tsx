import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useKeyboard } from '@/hooks/useKeyboard';
import { isNativeApp } from '@/utils/platformDetection';

interface KeyboardAwareInputProps extends React.ComponentProps<"input"> {
  scrollOnFocus?: boolean;
}

export const KeyboardAwareInput = ({ 
  scrollOnFocus = true,
  onFocus,
  ...props 
}: KeyboardAwareInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isVisible, keyboardHeight } = useKeyboard();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (scrollOnFocus && isNativeApp() && inputRef.current) {
      // Scroll input into view when keyboard appears
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
    onFocus?.(e);
  };

  useEffect(() => {
    if (isVisible && scrollOnFocus && inputRef.current === document.activeElement) {
      inputRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isVisible, scrollOnFocus, keyboardHeight]);

  return <Input ref={inputRef} onFocus={handleFocus} {...props} />;
};
