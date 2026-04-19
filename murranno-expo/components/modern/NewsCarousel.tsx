import { View, Text, StyleSheet } from 'react-native';

export const NewsCarousel = () => {
    const news: any[] = [];

    if (news.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No new updates at the moment.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Implementation for when news exists */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    emptyContainer: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    emptyText: {
        fontSize: 13,
        color: '#475569',
        textAlign: 'center',
    },
});
