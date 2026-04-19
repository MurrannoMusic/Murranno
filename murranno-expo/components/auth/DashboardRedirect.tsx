import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DashboardRedirect = () => {
  const { loading, accessibleTiers, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
      if (!loading) {
        if (userRole?.tier === 'admin') {
          router.replace('/admin');
          return;
        }

        const lastViewed = await AsyncStorage.getItem('lastViewedDashboard') as 'artist' | 'label' | 'agency' | null;

        if (lastViewed && accessibleTiers.includes(lastViewed)) {
          const dashboardMap = {
            artist: '/app/dashboard',
            label: '/app/label-dashboard',
            agency: '/app/agency-dashboard',
          };
          router.replace(dashboardMap[lastViewed]);
        } else {
          router.replace('/app/dashboard');
        }
      }
    };
    checkRedirect();
  }, [loading, accessibleTiers, userRole, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    color: '#666',
  },
});
