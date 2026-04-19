/**
 * TopBar - React Native
 * Shared header component matching web AppHeader
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { gradients } from '../../theme/gradients';
import Badge from '../ui/Badge';

interface TopBarProps {
  title?: string;
  userType?: 'artist' | 'label' | 'agency' | 'admin';
  showLogo?: boolean;
  showAvatar?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  onLogoPress?: () => void;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  userType = 'artist',
  showLogo = true,
  showAvatar = true,
  showNotifications = false,
  notificationCount = 0,
  onLogoPress,
  onAvatarPress,
  onNotificationPress,
  onBackPress,
  showBack = false,
}) => {
  const getBadgeVariant = () => {
    switch (userType) {
      case 'label':
        return 'secondary';
      case 'agency':
        return 'accent';
      case 'admin':
        return 'destructive';
      default:
        return 'primary';
    }
  };

  const getBadgeText = () => {
    if (title) return title;
    return userType.toUpperCase();
  };

  return (
    <LinearGradient colors={gradients.dark.colors} style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          ) : showLogo ? (
            <TouchableOpacity onPress={onLogoPress}>
              <Image
                source={require('../../assets/mm_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Badge variant={getBadgeVariant()}>
            {getBadgeText()}
          </Badge>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.iconButton}
            >
              <Ionicons name="notifications" size={24} color={colors.white} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {showAvatar && (
            <TouchableOpacity onPress={onAvatarPress} style={styles.avatarButton}>
              <Ionicons name="person-circle" size={32} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  logo: {
    height: 32,
    width: 100,
  },
  placeholder: {
    width: 100,
  },
  backButton: {
    padding: 4,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  avatarButton: {
    padding: 4,
  },
});

export default TopBar;
