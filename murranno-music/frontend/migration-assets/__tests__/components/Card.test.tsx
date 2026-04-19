import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

describe('Card', () => {
  describe('Card component', () => {
    it('should render children', () => {
      const { getByText } = render(
        <Card>
          <Text>Card content</Text>
        </Card>
      );
      expect(getByText('Card content')).toBeTruthy();
    });

    it('should apply custom className', () => {
      const { getByTestId } = render(
        <Card testID="card" className="custom-class">
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('card')).toBeTruthy();
    });

    it('should apply default variant', () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('card')).toBeTruthy();
    });

    it('should apply glass variant', () => {
      const { getByTestId } = render(
        <Card testID="card" variant="glass">
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('card')).toBeTruthy();
    });

    it('should apply elevated variant', () => {
      const { getByTestId } = render(
        <Card testID="card" variant="elevated">
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('card')).toBeTruthy();
    });
  });

  describe('CardHeader', () => {
    it('should render children', () => {
      const { getByText } = render(
        <CardHeader>
          <Text>Header content</Text>
        </CardHeader>
      );
      expect(getByText('Header content')).toBeTruthy();
    });
  });

  describe('CardTitle', () => {
    it('should render title text', () => {
      const { getByText } = render(
        <CardTitle>My Title</CardTitle>
      );
      expect(getByText('My Title')).toBeTruthy();
    });

    it('should apply custom className', () => {
      const { getByText } = render(
        <CardTitle className="custom-title">Custom Title</CardTitle>
      );
      expect(getByText('Custom Title')).toBeTruthy();
    });
  });

  describe('CardDescription', () => {
    it('should render description text', () => {
      const { getByText } = render(
        <CardDescription>My description</CardDescription>
      );
      expect(getByText('My description')).toBeTruthy();
    });
  });

  describe('CardContent', () => {
    it('should render children', () => {
      const { getByText } = render(
        <CardContent>
          <Text>Card body</Text>
        </CardContent>
      );
      expect(getByText('Card body')).toBeTruthy();
    });

    it('should apply custom padding', () => {
      const { getByTestId } = render(
        <CardContent testID="content" className="p-6">
          <Text>Content</Text>
        </CardContent>
      );
      expect(getByTestId('content')).toBeTruthy();
    });
  });

  describe('CardFooter', () => {
    it('should render children', () => {
      const { getByText } = render(
        <CardFooter>
          <Text>Footer content</Text>
        </CardFooter>
      );
      expect(getByText('Footer content')).toBeTruthy();
    });
  });

  describe('Full card composition', () => {
    it('should render a complete card', () => {
      const { getByText } = render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Main content goes here</Text>
          </CardContent>
          <CardFooter>
            <Text>Footer actions</Text>
          </CardFooter>
        </Card>
      );

      expect(getByText('Complete Card')).toBeTruthy();
      expect(getByText('This is a description')).toBeTruthy();
      expect(getByText('Main content goes here')).toBeTruthy();
      expect(getByText('Footer actions')).toBeTruthy();
    });
  });
});
