import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../../components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input field', () => {
      const { getByTestId } = render(
        <Input testID="input" placeholder="Enter text" />
      );
      expect(getByTestId('input')).toBeTruthy();
    });

    it('should render with label', () => {
      const { getByText } = render(
        <Input label="Email" placeholder="Enter email" />
      );
      expect(getByText('Email')).toBeTruthy();
    });

    it('should render with helper text', () => {
      const { getByText } = render(
        <Input helperText="This is helper text" />
      );
      expect(getByText('This is helper text')).toBeTruthy();
    });

    it('should render with error message', () => {
      const { getByText } = render(
        <Input error="This field is required" />
      );
      expect(getByText('This field is required')).toBeTruthy();
    });
  });

  describe('input types', () => {
    it('should handle text input', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input testID="input" onChangeText={onChangeText} />
      );
      
      fireEvent.changeText(getByTestId('input'), 'Hello');
      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('should handle email input', () => {
      const { getByTestId } = render(
        <Input testID="input" keyboardType="email-address" />
      );
      expect(getByTestId('input')).toBeTruthy();
    });

    it('should handle secure text entry', () => {
      const { getByTestId } = render(
        <Input testID="input" secureTextEntry />
      );
      expect(getByTestId('input').props.secureTextEntry).toBe(true);
    });
  });

  describe('icons', () => {
    it('should render left icon', () => {
      const LeftIcon = () => <></>;
      const { UNSAFE_getAllByType } = render(
        <Input leftIcon={<LeftIcon />} />
      );
      expect(UNSAFE_getAllByType(LeftIcon)).toHaveLength(1);
    });

    it('should render right icon', () => {
      const RightIcon = () => <></>;
      const { UNSAFE_getAllByType } = render(
        <Input rightIcon={<RightIcon />} />
      );
      expect(UNSAFE_getAllByType(RightIcon)).toHaveLength(1);
    });
  });

  describe('states', () => {
    it('should handle disabled state', () => {
      const { getByTestId } = render(
        <Input testID="input" editable={false} />
      );
      expect(getByTestId('input').props.editable).toBe(false);
    });

    it('should handle focus state', () => {
      const onFocus = jest.fn();
      const { getByTestId } = render(
        <Input testID="input" onFocus={onFocus} />
      );
      
      fireEvent(getByTestId('input'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('should handle blur state', () => {
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <Input testID="input" onBlur={onBlur} />
      );
      
      fireEvent(getByTestId('input'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('multiline', () => {
    it('should render as multiline', () => {
      const { getByTestId } = render(
        <Input testID="input" multiline numberOfLines={4} />
      );
      expect(getByTestId('input').props.multiline).toBe(true);
    });
  });

  describe('value handling', () => {
    it('should display initial value', () => {
      const { getByDisplayValue } = render(
        <Input value="Initial value" />
      );
      expect(getByDisplayValue('Initial value')).toBeTruthy();
    });

    it('should update value on change', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <Input testID="input" onChangeText={onChangeText} />
      );
      
      fireEvent.changeText(getByTestId('input'), 'New value');
      expect(onChangeText).toHaveBeenCalledWith('New value');
    });
  });

  describe('accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <Input accessibilityLabel="Email input" />
      );
      expect(getByLabelText('Email input')).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      const { getByTestId } = render(
        <Input 
          testID="input" 
          accessibilityHint="Enter your email address"
        />
      );
      expect(getByTestId('input').props.accessibilityHint).toBe('Enter your email address');
    });
  });
});
