import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (data: Omit<ToastData, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastItemProps {
  data: ToastData;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ data, onRemove }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 25,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      dismiss();
    }, data.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove(data.id));
  };

  const getVariantStyles = (): { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string } => {
    switch (data.variant) {
      case 'success':
        return { bg: colors.success, icon: 'checkmark-circle', iconColor: '#FFFFFF' };
      case 'error':
        return { bg: colors.destructive, icon: 'close-circle', iconColor: '#FFFFFF' };
      case 'warning':
        return { bg: colors.warning, icon: 'warning', iconColor: '#000000' };
      default:
        return { bg: colors.card, icon: 'information-circle', iconColor: colors.primary };
    }
  };

  const variantStyles = getVariantStyles();
  const isDefaultVariant = data.variant === 'default' || !data.variant;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: variantStyles.bg },
        isDefaultVariant && styles.toastDefault,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons
          name={variantStyles.icon}
          size={20}
          color={variantStyles.iconColor}
          style={styles.toastIcon}
        />
        <View style={styles.toastTextContainer}>
          <Text
            style={[
              styles.toastTitle,
              !isDefaultVariant && { color: '#FFFFFF' },
            ]}
          >
            {data.title}
          </Text>
          {data.description && (
            <Text
              style={[
                styles.toastDescription,
                !isDefaultVariant && { color: 'rgba(255,255,255,0.8)' },
              ]}
            >
              {data.description}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name="close"
            size={18}
            color={isDefaultVariant ? colors.mutedForeground : 'rgba(255,255,255,0.8)'}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const insets = useSafeAreaInsets();

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    Haptics.notificationAsync(
      data.variant === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : data.variant === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View style={[styles.container, { top: insets.top + spacing[2] }]}>
        {toasts.map((t) => (
          <ToastItem key={t.id} data={t} onRemove={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
    gap: spacing[2],
  },
  toast: {
    borderRadius: 16,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastDefault: {
    borderWidth: 1,
    borderColor: `${colors.border}33`,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  toastIcon: {
    marginRight: spacing[3],
    marginTop: 2,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
  },
  toastDescription: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    marginTop: spacing[1],
  },
});

export default ToastProvider;
