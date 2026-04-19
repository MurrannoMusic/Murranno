import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PromotionService } from '@/types/promotion';
import { Check, ShoppingCart, ShoppingBag } from 'lucide-react-native';
import { useCart } from '@/hooks/useCart';
import { Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ServiceCardProps {
    service: PromotionService;
    onSelect: (service: PromotionService) => void;
}

export const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
    const { addToCart, removeFromCart, isInCart } = useCart();
    const inCart = isInCart(service.id);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const isProcessing = isBuyingNow || isAddingToCart;

    const handleBuyNow = async () => {
        setIsBuyingNow(true);
        try {
            await onSelect(service);
            Alert.alert('Proceeding to checkout', `${service.name} - ${formatPrice(service.price)}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to process purchase');
        } finally {
            setIsBuyingNow(false);
        }
    };

    const handleAddToCart = async () => {
        setIsAddingToCart(true);
        try {
            await addToCart(service);
            Alert.alert('Added to cart', service.name);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleRemoveFromCart = async () => {
        setIsAddingToCart(true);
        try {
            await removeFromCart(service.id);
            Alert.alert('Removed from cart', service.name);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const displayImages = service.images && service.images.length > 0
        ? service.images
        : service.imageUrl
        ? [service.imageUrl]
        : [];

    const displayVideos = service.videos || [];
    const hasMedia = displayImages.length > 0 || displayVideos.length > 0;
    const allMedia = [...displayImages, ...displayVideos];

    const getCloudinaryUrl = (publicId: string) => {
        if (publicId.startsWith('http')) return publicId;
        // Basic resolution logic for cloudinary URIs. Adjust the cloud name accordingly.
        return `https://res.cloudinary.com/dbx6yepne/image/upload/w_600,c_fill/${publicId}`;
    };

    return (
        <View style={styles.card}>
            {hasMedia ? (
                <View style={styles.mediaContainer}>
                    {allMedia.length === 1 ? (
                        displayVideos.length > 0 ? (
                            <Video
                                source={{ uri: displayVideos[0] }}
                                style={styles.mediaItem}
                                useNativeControls
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                                isMuted
                            />
                        ) : (
                            <Image
                                source={{ uri: getCloudinaryUrl(displayImages[0]) }}
                                style={styles.mediaItem}
                            />
                        )
                    ) : (
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
                            {displayImages.map((img, i) => (
                                <Image
                                    key={`img-${i}`}
                                    source={{ uri: getCloudinaryUrl(img) }}
                                    style={styles.carouselItem}
                                />
                            ))}
                            {displayVideos.map((vid, i) => (
                                <Video
                                    key={`vid-${i}`}
                                    source={{ uri: vid }}
                                    style={styles.carouselItem}
                                    useNativeControls
                                    resizeMode={ResizeMode.COVER}
                                    isLooping
                                    shouldPlay
                                    isMuted
                                />
                            ))}
                        </ScrollView>
                    )}
                    <View style={styles.badgeOverlay}>
                        <View style={styles.badgeInner}>
                            <Text style={styles.badgeText}>{service.category}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.placeholderContainer}>
                    <ShoppingBag size={40} color="rgba(150, 150, 150, 0.4)" />
                    <View style={styles.badgeOverlay}>
                        <View style={styles.badgeInner}>
                            <Text style={styles.badgeText}>{service.category}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.headerArea}>
                <Text style={styles.title} numberOfLines={1}>{service.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
            </View>

            <View style={styles.contentArea}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{formatPrice(service.price)}</Text>
                    {service.duration && (
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>{service.duration}</Text>
                        </View>
                    )}
                </View>

                {service.features && service.features.length > 0 && (
                    <View style={styles.featuresList}>
                        {service.features.slice(0, 2).map((feat, i) => (
                            <View key={i} style={styles.featureItem}>
                                <Check size={12} color="#0f172a" style={styles.featureIcon} />
                                <Text style={styles.featureText} numberOfLines={1}>{feat}</Text>
                            </View>
                        ))}
                        {service.features.length > 2 && (
                            <Text style={styles.moreFeaturesText}>+ {service.features.length - 2} more features</Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.footerArea}>
                <Pressable
                    style={[styles.buyBtn, isProcessing && styles.btnDisabled]}
                    disabled={isProcessing}
                    onPress={handleBuyNow}
                >
                    {isBuyingNow ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buyBtnText}>Book Now</Text>
                    )}
                </Pressable>

                <Pressable
                    style={[
                        styles.cartBtn,
                        inCart && styles.inCartBtn,
                        isProcessing && styles.btnDisabled
                    ]}
                    disabled={isProcessing}
                    onPress={inCart ? handleRemoveFromCart : handleAddToCart}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator size="small" color={inCart ? "#ef4444" : "#0f172a"} />
                    ) : inCart ? (
                        <Check size={14} color="#ef4444" />
                    ) : (
                        <ShoppingCart size={14} color="#0f172a" />
                    )}
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: SCREEN_WIDTH * 0.85,
        maxWidth: 350,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#f1f5f9',
        position: 'relative',
    },
    mediaItem: {
        width: '100%',
        height: '100%',
    },
    carousel: {
        width: '100%',
        height: '100%',
    },
    carouselItem: {
        width: SCREEN_WIDTH * 0.85 > 350 ? 350 : SCREEN_WIDTH * 0.85, // Same as card width roughly
        height: '100%',
    },
    placeholderContainer: {
        width: '100%',
        height: 128,
        backgroundColor: 'rgba(241, 245, 249, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badgeOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
    },
    badgeInner: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#334155',
    },
    headerArea: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    description: {
        fontSize: 10,
        color: '#64748b',
    },
    contentArea: {
        paddingHorizontal: 12,
        paddingBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        paddingBottom: 8,
        marginBottom: 8,
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    durationBadge: {
        backgroundColor: 'rgba(241, 245, 249, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    durationText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#64748b',
    },
    featuresList: {
        gap: 4,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
    },
    featureIcon: {
        marginTop: 2,
    },
    featureText: {
        fontSize: 10,
        color: '#64748b',
        flex: 1,
    },
    moreFeaturesText: {
        fontSize: 10,
        color: '#64748b',
        fontStyle: 'italic',
        paddingLeft: 16,
        marginTop: 4,
    },
    footerArea: {
        padding: 12,
        flexDirection: 'row',
        gap: 8,
        marginTop: 'auto',
    },
    buyBtn: {
        flex: 1,
        backgroundColor: '#0f172a',
        height: 36,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cartBtn: {
        width: 36,
        height: 36,
        backgroundColor: '#f1f5f9',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inCartBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    btnDisabled: {
        opacity: 0.7,
    }
});
