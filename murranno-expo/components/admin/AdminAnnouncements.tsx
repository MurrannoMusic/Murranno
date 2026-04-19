import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Switch, TextInput, Pressable, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
// Note: If you have an AdminLayout, you would wrap this return in it. 
// For now, using SafeAreaView as equivalent replacement.

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
    is_active: boolean;
    created_at: string;
}

export default function AdminAnnouncements() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        is_active: true
    });

    const { data: announcements, isLoading } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_announcements')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Announcement[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const { error } = await supabase.from('system_announcements').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setDialogOpen(false);
            Alert.alert('Success', 'Announcement created');
        },
        onError: (err: any) => Alert.alert('Error', err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const { error } = await supabase.from('system_announcements').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setDialogOpen(false);
        },
        onError: (err: any) => Alert.alert('Error', err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('system_announcements').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            Alert.alert('Success', 'Announcement deleted');
        },
        onError: (err: any) => Alert.alert('Error', err.message)
    });

    const handleSubmit = () => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (item: Announcement) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            message: item.message,
            type: item.type as string,
            is_active: item.is_active
        });
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            message: '',
            type: 'info',
            is_active: true
        });
        setDialogOpen(true);
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Announcement",
            "Are you sure you want to completely delete this?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.pageTitle}>System Announcements</Text>
                    <Text style={styles.pageSubtitle}>Manage global banners and alerts</Text>
                </View>
                <Pressable style={styles.addButton} onPress={handleAddNew}>
                    <Plus size={16} color="#fff" style={styles.addIcon} />
                    <Text style={styles.addButtonText}>New</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, { width: 60 }]}>Status</Text>
                            <Text style={[styles.th, { width: 140 }]}>Title</Text>
                            <Text style={[styles.th, { width: 200 }]}>Message</Text>
                            <Text style={[styles.th, { width: 80 }]}>Type</Text>
                            <Text style={[styles.th, { width: 100 }]}>Created</Text>
                            <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>Actions</Text>
                        </View>
                        
                        <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#000" style={{marginTop: 24}}/>
                            ) : announcements?.length === 0 ? (
                                <Text style={styles.emptyText}>No announcements found</Text>
                            ) : (
                                announcements?.map((item) => (
                                    <View style={styles.tableRow} key={item.id}>
                                        <View style={{ width: 60 }}>
                                            <Switch
                                                value={item.is_active}
                                                onValueChange={(val) => updateMutation.mutate({ id: item.id, data: { is_active: val } })}
                                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                            />
                                        </View>
                                        <Text style={[styles.td, styles.tdFontMedium, { width: 140 }]} numberOfLines={1}>{item.title}</Text>
                                        <Text style={[styles.td, { width: 200 }]} numberOfLines={1}>{item.message}</Text>
                                        <View style={{ width: 80, justifyContent: 'center' }}>
                                            <View style={[
                                                styles.badge, 
                                                item.type === 'critical' ? styles.badgeDestructive : 
                                                item.type === 'warning' ? styles.badgeWarning : 
                                                styles.badgeDefault
                                            ]}>
                                                <Text style={styles.badgeText}>{item.type}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.td, { width: 100 }]}>{formatDate(item.created_at)}</Text>
                                        <View style={[styles.actionCell, { width: 80 }]}>
                                            <Pressable style={styles.iconButton} onPress={() => handleEdit(item)}>
                                                <Edit size={16} color="#64748b" />
                                            </Pressable>
                                            <Pressable style={styles.iconButton} onPress={() => confirmDelete(item.id)}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>

            <Modal
                visible={dialogOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setDialogOpen(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.dialogContent}>
                        <View style={styles.dialogHeader}>
                            <Text style={styles.dialogTitle}>{editingItem ? 'Edit Announcement' : 'New Announcement'}</Text>
                        </View>
                        <ScrollView style={styles.formArea} showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.title}
                                    onChangeText={(val) => setFormData({ ...formData, title: val })}
                                    placeholder="Maintenance Alert"
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Message</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.message}
                                    onChangeText={(val) => setFormData({ ...formData, message: val })}
                                    placeholder="System will be down for..."
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Type (info | warning | critical)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.type}
                                    onChangeText={(val) => setFormData({ ...formData, type: val })}
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.switchRow}>
                                <Switch 
                                    value={formData.is_active} 
                                    onValueChange={(val) => setFormData({ ...formData, is_active: val })} 
                                />
                                <Text style={styles.switchLabel}>Active immediately</Text>
                            </View>
                        </ScrollView>
                        <View style={styles.dialogFooter}>
                            <Pressable style={[styles.dialogBtn, styles.cancelBtn]} onPress={() => setDialogOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </Pressable>
                            <Pressable style={[styles.dialogBtn, styles.submitBtn]} onPress={handleSubmit}>
                                <Text style={styles.submitBtnText}>{editingItem ? 'Update' : 'Create'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    addIcon: {
        marginRight: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        flex: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 12,
        marginBottom: 12,
    },
    th: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        paddingHorizontal: 8,
    },
    tableBody: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    td: {
        fontSize: 14,
        color: '#334155',
        paddingHorizontal: 8,
    },
    tdFontMedium: {
        fontWeight: '500',
        color: '#0f172a',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 32,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeDefault: {
        backgroundColor: '#e0f2fe',
    },
    badgeWarning: {
        backgroundColor: '#fef08a',
    },
    badgeDestructive: {
        backgroundColor: '#fee2e2',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
        color: '#000',
    },
    actionCell: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingHorizontal: 8,
    },
    iconButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContent: {
        backgroundColor: '#fff',
        width: '90%',
        maxHeight: '85%',
        borderRadius: 12,
        padding: 24,
    },
    dialogHeader: {
        marginBottom: 16,
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    formArea: {
        maxHeight: 400,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: '#334155',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        color: '#0f172a',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    switchLabel: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
        color: '#334155',
    },
    dialogFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    dialogBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelBtnText: {
        color: '#334155',
        fontWeight: '500',
    },
    submitBtn: {
        backgroundColor: '#0f172a',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: '500',
    }
});
