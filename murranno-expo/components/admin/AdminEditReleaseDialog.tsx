import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminRelease } from '@/types/admin';

interface AdminEditReleaseDialogProps {
    release: AdminRelease | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminEditReleaseDialog({ release, open, onOpenChange }: AdminEditReleaseDialogProps) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        release_type: '',
        status: '',
        release_date: '',
        label: '',
        upc_ean: '',
    });

    const [initializedId, setInitializedId] = useState<string | null>(null);

    useEffect(() => {
        if (release && release.id !== initializedId) {
            setFormData({
                title: release.title || '',
                genre: release.genre || '',
                release_type: release.release_type || '',
                status: release.status || '',
                release_date: release.release_date ? release.release_date.split('T')[0] : '',
                label: release.label || '',
                upc_ean: release.upc_ean || '',
            });
            setInitializedId(release.id);
        }
    }, [release, initializedId]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!release) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('releases')
                .update({
                    title: formData.title,
                    genre: formData.genre,
                    release_type: formData.release_type,
                    status: formData.status,
                    release_date: formData.release_date,
                    label: formData.label || null,
                    upc_ean: formData.upc_ean || null,
                })
                .eq('id', release.id);

            if (error) throw error;

            Alert.alert('Success', 'Release updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-releases'] });
            onOpenChange(false);
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', error.message || 'Failed to update release');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!release) return;
        
        Alert.alert(
            'Delete Release',
            'Are you sure you want to DELETE this release? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase
                                .from('releases')
                                .delete()
                                .eq('id', release.id);

                            if (error) throw error;

                            Alert.alert('Success', 'Release deleted completely');
                            queryClient.invalidateQueries({ queryKey: ['admin-releases'] });
                            onOpenChange(false);
                        } catch (error: any) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', error.message || 'Failed to delete release');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={open}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onOpenChange(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.dialogContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Release</Text>
                        <Text style={styles.description}>Modify details for {release?.title}.</Text>
                    </View>

                    <ScrollView style={styles.formArea} showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(val) => handleChange('title', val)}
                                placeholder="Release Title"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Type (Single, EP, Album)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.release_type}
                                onChangeText={(val) => handleChange('release_type', val)}
                                placeholder="Select type"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Genre</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.genre}
                                onChangeText={(val) => handleChange('genre', val)}
                                placeholder="Genre"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Status (Draft, Pending, Published, Rejected, Takedown)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.status}
                                onChangeText={(val) => handleChange('status', val)}
                                placeholder="Select status"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Release Date</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.release_date}
                                onChangeText={(val) => handleChange('release_date', val)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Label</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.label}
                                onChangeText={(val) => handleChange('label', val)}
                                placeholder="Label Name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>UPC/EAN</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.upc_ean}
                                onChangeText={(val) => handleChange('upc_ean', val)}
                                placeholder="UPC/EAN Code"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable 
                            style={[styles.button, styles.deleteButton]} 
                            onPress={handleDelete}
                            disabled={loading}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                        <View style={styles.rightActions}>
                            <Pressable 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.button, styles.saveButton, loading && styles.disabledButton]} 
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Details</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContent: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    formArea: {
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#f8fafc',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: 'transparent',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#0f172a',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.7,
    }
});
