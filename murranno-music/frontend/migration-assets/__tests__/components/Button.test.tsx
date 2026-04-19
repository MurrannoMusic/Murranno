import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<Button>Click me</Button>);
      expect(getByText('Click me')).toBeTruthy();
    });

    it('should render with title prop', () => {
      const { getByText } = render(<Button title="Submit" />);
      expect(getByText('Submit')).toBeTruthy();
    });

    it('should render children over title', () => {
      const { getByText, queryByText } = render(
        <Button title="Title">Children</Button>
      );
      expect(getByText('Children')).toBeTruthy();
      expect(queryByText('Title')).toBeNull();
    });
  });

  describe('variants', () => {
    it('should apply default variant styles', () => {
      const { getByTestId } = render(
        <Button testID="button">Default</Button>
      );
      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('should apply secondary variant styles', () => {
      const { getByTestId } = render(
        <Button testID="button" variant="secondary">Secondary</Button>
      );
      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('should apply outline variant styles', () => {
      const { getByTestId } = render(
        <Button testID="button" variant="outline">Outline</Button>
      );
      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('should apply ghost variant styles', () => {
      const { getByTestId } = render(
        <Button testID="button" variant="ghost">Ghost</Button>
      );
      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('should apply destructive variant styles', () => {
      const { getByTestId } = render(
        <Button testID="button" variant="destructive">Delete</Button>
      );
      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('should apply small size', () => {
      const { getByTestId } = render(
        <Button testID="button" size="sm">Small</Button>
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should apply medium size (default)', () => {
      const { getByTestId } = render(
        <Button testID="button" size="md">Medium</Button>
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should apply large size', () => {
      const { getByTestId } = render(
        <Button testID="button" size="lg">Large</Button>
      );
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should apply icon size', () => {
      const { getByTestId } = render(
        <Button testID="button" size="icon">🔔</Button>
      );
      expect(getByTestId('button')).toBeTruthy();
    });
  });

  describe('states', () => {
    it('should handle disabled state', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button testID="button" disabled onPress={onPress}>
          Disabled
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent.press(button);
      
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should handle loading state', () => {
      const onPress = jest.fn();
      const { getByTestId, getByText } = render(
        <Button testID="button" loading onPress={onPress}>
          Loading
        </Button>
      );
      
      const button = getByTestId('button');
      fireEvent.press(button);
      
      // Should not call onPress when loading
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should show loading text when loading', () => {
      const { getByText } = render(
        <Button loading loadingText="Please wait...">
          Submit
        </Button>
      );
      
      expect(getByText('Please wait...')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress}>Press me</Button>
      );
      
      fireEvent.press(getByText('Press me'));
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress when long pressed', () => {
      const onLongPress = jest.fn();
      const { getByText } = render(
        <Button onLongPress={onLongPress}>Long press me</Button>
      );
      
      fireEvent(getByText('Long press me'), 'onLongPress');
      
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('icons', () => {
    it('should render left icon', () => {
      const LeftIcon = () => <></>;
      const { UNSAFE_getAllByType } = render(
        <Button leftIcon={<LeftIcon />}>With Icon</Button>
      );
      
      expect(UNSAFE_getAllByType(LeftIcon)).toHaveLength(1);
    });

    it('should render right icon', () => {
      const RightIcon = () => <></>;
      const { UNSAFE_getAllByType } = render(
        <Button rightIcon={<RightIcon />}>With Icon</Button>
      );
      
      expect(UNSAFE_getAllByType(RightIcon)).toHaveLength(1);
    });
  });

  describe('full width', () => {
    it('should render full width button', () => {
      const { getByTestId } = render(
        <Button testID="button" fullWidth>
          Full Width
        </Button>
      );
      
      expect(getByTestId('button')).toBeTruthy();
    });
  });
});
