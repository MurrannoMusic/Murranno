/**
 * UploadScreen - React Native
 * Matches src/pages/Upload.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { gradients } from '../theme/gradients';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';

type TrackType = 'clean' | 'explicit';

interface FileInfo {
  name: string;
  size: number;
  uri: string;
}

const UploadScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { showToast } = useToast();

  // File states
  const [audioFile, setAudioFile] = useState<FileInfo | null>(null);
  const [coverArt, setCoverArt] = useState<FileInfo | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  
  // Form states
  const [trackTitle, setTrackTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [labelName, setLabelName] = useState('');
  const [trackType, setTrackType] = useState<TrackType>('clean');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  
  // Upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAudioSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setAudioFile({
          name: file.name,
          size: file.size || 0,
          uri: file.uri,
        });
        showToast('Audio file selected', 'success');
      }
    } catch (error) {
      showToast('Failed to select audio file', 'error');
    }
  };

  const handleCoverArtSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setCoverArt({
          name: 'cover-art.jpg',
          size: 0,
          uri: asset.uri,
        });
        setCoverArtPreview(asset.uri);
        showToast('Cover art selected', 'success');
      }
    } catch (error) {
      showToast('Failed to select cover art', 'error');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showToast('Camera permission required', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setCoverArt({
          name: 'cover-art.jpg',
          size: 0,
          uri: asset.uri,
        });
        setCoverArtPreview(asset.uri);
        showToast('Photo captured', 'success');
      }
    } catch (error) {
      showToast('Failed to capture photo', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      showToast('Please select an audio file', 'error');
      return;
    }

    if (!trackTitle || !artistName || !releaseDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      showToast('Track uploaded successfully!', 'success');
      
      setTimeout(() => {
        navigation.navigate('Releases');
      }, 1000);
    } catch (error) {
      showToast('Failed to upload track', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = audioFile && trackTitle && artistName && releaseDate;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/mm_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Badge variant="outline">UPLOAD</Badge>
        <TouchableOpacity style={styles.avatarButton}>
          <Ionicons name="person-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Audio File Upload */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Audio File</Text>
          
          {!audioFile ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleAudioSelect}
              disabled={isSubmitting}
            >
              <Ionicons name="musical-notes" size={32} color={colors.mutedForeground} />
              <Text style={styles.uploadButtonText}>Select Audio File</Text>
              <Text style={styles.uploadButtonHint}>MP3, WAV, FLAC (Max 100MB)</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.filePreview}>
              <View style={styles.fileInfo}>
                <Ionicons name="musical-notes" size={32} color={colors.primary} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{audioFile.name}</Text>
                  <Text style={styles.fileSize}>{formatFileSize(audioFile.size)}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setAudioFile(null)}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Cover Art Upload */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Artwork</Text>
          
          {!coverArt ? (
            <View style={styles.coverArtSection}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleCoverArtSelect}
                disabled={isSubmitting}
              >
                <Ionicons name="image" size={32} color={colors.mutedForeground} />
                <Text style={styles.uploadButtonText}>Select Cover Art</Text>
                <Text style={styles.uploadButtonHint}>Recommended: 3000x3000px</Text>
              </TouchableOpacity>
              
              <View style={styles.coverArtActions}>
                <TouchableOpacity
                  style={styles.coverArtButton}
                  onPress={handleTakePhoto}
                  disabled={isSubmitting}
                >
                  <Ionicons name="camera" size={18} color={colors.foreground} />
                  <Text style={styles.coverArtButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.coverArtButton}
                  onPress={handleCoverArtSelect}
                  disabled={isSubmitting}
                >
                  <Ionicons name="image" size={18} color={colors.foreground} />
                  <Text style={styles.coverArtButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.filePreview}>
              <View style={styles.fileInfo}>
                {coverArtPreview && (
                  <Image source={{ uri: coverArtPreview }} style={styles.coverPreview} />
                )}
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{coverArt.name}</Text>
                  <Text style={styles.fileSize}>Cover Art</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setCoverArt(null);
                  setCoverArtPreview(null);
                }}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Track Information */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Track Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Track Title *</Text>
            <TextInput
              style={styles.input}
              value={trackTitle}
              onChangeText={setTrackTitle}
              placeholder="Enter track title"
              placeholderTextColor={colors.mutedForeground}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Artist Name *</Text>
            <TextInput
              style={styles.input}
              value={artistName}
              onChangeText={setArtistName}
              placeholder="Enter artist name"
              placeholderTextColor={colors.mutedForeground}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Genre</Text>
            <TextInput
              style={styles.input}
              value={genre}
              onChangeText={setGenre}
              placeholder="Select or enter genre"
              placeholderTextColor={colors.mutedForeground}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Label Name</Text>
            <TextInput
              style={styles.input}
              value={labelName}
              onChangeText={setLabelName}
              placeholder="Enter label name (optional)"
              placeholderTextColor={colors.mutedForeground}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Track Type</Text>
            <View style={styles.trackTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.trackTypeButton,
                  trackType === 'clean' && styles.trackTypeButtonActive,
                ]}
                onPress={() => setTrackType('clean')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.trackTypeText,
                    trackType === 'clean' && styles.trackTypeTextActive,
                  ]}
                >
                  Clean
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.trackTypeButton,
                  trackType === 'explicit' && styles.trackTypeButtonActive,
                ]}
                onPress={() => setTrackType('explicit')}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.trackTypeText,
                    trackType === 'explicit' && styles.trackTypeTextActive,
                  ]}
                >
                  Explicit
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Release Date *</Text>
            <TextInput
              style={styles.input}
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about your track..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>
        </Card>

        {/* Upload Progress */}
        {isSubmitting && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.progressText}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
            <Progress value={uploadProgress} />
          </Card>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          <LinearGradient
            colors={isFormValid ? gradients.primary.colors : ['#4B5563', '#374151']}
            start={gradients.primary.start}
            end={gradients.primary.end}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color={colors.white} />
                <Text style={styles.submitText}>Upload Track</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  logo: {
    height: 32,
    width: 100,
  },
  avatarButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  uploadButtonHint: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  fileSize: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  coverPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  coverArtSection: {
    gap: 12,
  },
  coverArtActions: {
    flexDirection: 'row',
    gap: 8,
  },
  coverArtButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  coverArtButtonText: {
    fontSize: 14,
    color: colors.foreground,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  trackTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  trackTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  trackTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  trackTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  trackTypeTextActive: {
    color: colors.white,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: colors.foreground,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default UploadScreen;
