import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload as UploadIcon, X, Music, Image as ImageIcon, Camera, Plus, Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";
import mmLogo from "@/assets/mm_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AvatarDropdown } from "@/components/layout/AvatarDropdown";
import { GenreSelector } from "@/components/forms/GenreSelector";
import { DynamicTextField } from "@/components/forms/DynamicTextField";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { useCamera } from "@/hooks/useCamera";
import { useHaptics } from "@/hooks/useHaptics";
import { useLocalNotifications } from "@/hooks/useLocalNotifications";
import { supabase } from "@/integrations/supabase/client";
import { validateAudioFile, validateImageFile, validateImageDimensions, getAudioDuration } from "@/utils/fileValidation";
import { formatFileSize } from "@/utils/formatters";
import { isNativeApp } from "@/utils/platformDetection";

const DISTRIBUTION_PLATFORMS = [
  "Spotify", "Apple Music", "TikTok", "Instagram",
  "YouTube Music", "Amazon Music", "Deezer", "Tidal",
  "Pandora", "SoundCloud", "Audiomack", "Boomplay",
  "iHeartRadio", "Napster", "Tencent", "NetEase"
];

interface TrackItem {
  id: string;
  file: File | null;
  title: string;
  duration: number | null;
  featuredArtists: string[];
  producers: string[];
  songwriters: string[];
  trackType: "clean" | "explicit";
  lyrics: string;
  legalName: string;
}

// Upload page component
export default function Upload() {
  const navigate = useNavigate();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverArtInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, uploadAudio, uploading, progress } = useCloudinaryUpload();
  const { takePhoto, pickFromGallery, isCapturing } = useCamera();
  const { success: hapticSuccess, error: hapticError } = useHaptics();
  const { scheduleTrackUploadComplete } = useLocalNotifications();

  // File & Track states
  const [releaseType, setReleaseType] = useState<"Single" | "EP" | "Album">("Single");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Form states (Release-wide)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [labelName, setLabelName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseDescription, setReleaseDescription] = useState("");

  // New fields
  const [isExistingRelease, setIsExistingRelease] = useState(false);
  const [upc, setUpc] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Additional Metadata
  const [language, setLanguage] = useState("English");
  const [recordingYear, setRecordingYear] = useState(new Date().getFullYear().toString());
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [copyrightHolder, setCopyrightHolder] = useState("");
  const [legalName, setLegalName] = useState(""); // For credits


  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: TrackItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const duration = await getAudioDuration(file);
        newTracks.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
          duration,
          featuredArtists: [],
          producers: [],
          songwriters: [],
          trackType: "clean",
          lyrics: "",
          legalName: legalName // Default to release-wide legal name
        });
      } catch (error) {
        toast.error(`Failed to load ${file.name}`);
      }
    }

    if (newTracks.length > 0) {
      setTracks(prev => [...prev, ...newTracks]);
      toast.success(`${newTracks.length} track(s) added`);
    }

    // Reset input
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const updateTrackField = (trackId: string, field: keyof TrackItem, value: any) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, [field]: value } : t));
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleCoverArtSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Strict dimension check
    const dimValidation = await validateImageDimensions(file);
    if (!dimValidation.valid) {
      toast.error(dimValidation.error);
      return;
    }

    setCoverArtFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverArtPreview(previewUrl);
    toast.success("Cover art selected");
  };

  const removeAudioFile = () => {
    setTracks([]);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const removeCoverArt = () => {
    setCoverArtFile(null);
    if (coverArtPreview) URL.revokeObjectURL(coverArtPreview);
    setCoverArtPreview(null);
    if (coverArtInputRef.current) coverArtInputRef.current.value = "";
  };

  const handleTakePhoto = async () => {
    const file = await takePhoto();
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setCoverArtFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverArtPreview(previewUrl);
      toast.success("Photo captured");
    }
  };

  const handlePickFromGallery = async () => {
    const file = await pickFromGallery();
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setCoverArtFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverArtPreview(previewUrl);
      toast.success("Image selected");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadTrack();
  };

  const uploadTrack = async () => {
    if (tracks.length === 0) {
      toast.error("Please add at least one track");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      // Get user's artist profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let { data: artistProfile } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!artistProfile) {
        console.log("Artist profile not found, attempting to create...");
        const { data: newProfile, error: createError } = await supabase
          .from('artists')
          .insert([{
            user_id: user.id,
            stage_name: user.user_metadata?.full_name || 'New Artist'
          }])
          .select('id')
          .single();

        if (createError) throw new Error("Artist profile not found.");
        artistProfile = newProfile;
      }

      // 1. Upload cover art
      let coverArtUrl = null;
      if (coverArtFile) {
        toast.info("Uploading cover art...");
        const coverResult = await uploadImage(coverArtFile, 'cover-art');
        coverArtUrl = coverResult.url;
      }

      // 2. Upload all audio files (parallel for speed)
      toast.info(`Uploading ${tracks.length} track(s)...`);
      const audioResults = await Promise.all(
        tracks.map(track => uploadAudio(track.file!, 'tracks'))
      );

      // 3. Prepare metadata
      const finalGenre = customGenre || selectedGenres[0];
      const releaseData = {
        title: releaseTitle,
        type: releaseType,
        releaseDate,
        genre: finalGenre,
        label: labelName || null,
        language,
        recording_year: recordingYear,
        copyright_holder: copyrightHolder || artistName,
        is_existing_release: isExistingRelease,
        upc: isExistingRelease ? upc : null,
        isrc: null, // ISRCs are usually track-level
        distribution_platforms: selectedPlatforms
      };

      const tracksPayload = tracks.map((track, index) => ({
        title: track.title,
        duration: track.duration || 0,
        featuredArtists: track.featuredArtists,
        producers: track.producers,
        songwriters: track.songwriters,
        trackType: track.trackType,
        description: releaseDescription,
        lyrics: track.lyrics,
        songwriter_legal_names: [track.legalName || legalName]
      }));

      // 4. Call edge function
      toast.info("Saving release metadata...");
      const { data, error } = await supabase.functions.invoke('upload-track', {
        body: {
          releaseData,
          tracks: tracksPayload,
          coverArtFile: coverArtUrl ? { url: coverArtUrl } : null,
          audioFiles: audioResults.map(res => ({ url: res.url }))
        }
      });

      if (error) throw error;

      hapticSuccess();
      await scheduleTrackUploadComplete(releaseTitle);
      toast.success(`${releaseType} uploaded successfully!`);

      setTimeout(() => navigate('/app/releases'), 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      hapticError();
      setUploadError(error.message || 'Failed to upload release');
      toast.error(error.message || 'Failed to upload release');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    uploadTrack();
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!releaseTitle || !artistName || !coverArtFile) {
        toast.error("Please provide Title, Artist, and Cover Art");
        return;
      }
      if (selectedGenres.length === 0 && !customGenre) {
        toast.error("Please select a genre");
        return;
      }
    } else if (currentStep === 2) {
      if (tracks.length === 0) {
        toast.error("Please upload at least one track");
        return;
      }
      if (tracks.some(t => !t.title)) {
        toast.error("All tracks must have titles");
        return;
      }
    } else if (currentStep === 3) {
      if (!releaseDate) {
        toast.error("Please select a release date");
        return;
      }
    } else if (currentStep === 4) {
      if (!legalName && tracks.some(t => !t.legalName)) {
        toast.error("Please provide songwriter legal names");
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  return (
    <div className="smooth-scroll min-h-screen bg-background p-3 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Progress Stepper */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center flex-1 ${step <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs font-medium border transition-colors ${step === currentStep ? 'bg-primary text-primary-foreground border-primary' :
                  step < currentStep ? 'bg-primary/20 border-primary text-primary' :
                    'bg-background border-muted text-muted-foreground'
                  }`}>
                  {step}
                </div>
                <span className="text-[10px] uppercase tracking-wider hidden sm:block">
                  {step === 1 && "Basics"}
                  {step === 2 && "The Music"}
                  {step === 3 && "Distribution"}
                  {step === 4 && "Credits"}
                  {step === 5 && "Review"}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
        </div>

        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Release Info</h2>
              <p className="text-xs text-muted-foreground">General details for your {releaseType}</p>
            </div>

            <Card className="p-4 space-y-3">
              <div>
                <Label>Release Type</Label>
                <div className="flex gap-2 mt-2">
                  {(["Single", "EP", "Album"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={releaseType === type ? "default" : "outline"}
                      onClick={() => setReleaseType(type)}
                      className="flex-1"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Release Title *</Label>
                <Input
                  id="title"
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  placeholder="Enter release title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="artist">Primary Artist *</Label>
                <Input
                  id="artist"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Enter artist name"
                  required
                />
              </div>

              <GenreSelector
                primaryGenre={selectedGenres[0] || ""}
                secondaryGenre={selectedGenres[1] || ""}
                customPrimaryGenre={customGenre}
                customSecondaryGenre=""
                onPrimaryGenreChange={(value) => setSelectedGenres([value, selectedGenres[1] || ""])}
                onSecondaryGenreChange={(value) => setSelectedGenres([selectedGenres[0] || "", value])}
                onCustomPrimaryGenreChange={setCustomGenre}
                onCustomSecondaryGenreChange={() => { }}
              />

              <div>
                <Label htmlFor="description">Release Description</Label>
                <Textarea
                  id="description"
                  value={releaseDescription}
                  onChange={(e) => setReleaseDescription(e.target.value)}
                  placeholder="Tell listeners about this release..."
                  className="h-24 resize-none"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cover Art *</h3>
              <input
                ref={coverArtInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverArtSelect}
                className="hidden"
              />

              {!coverArtFile ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-48 border-dashed mb-4"
                    onClick={() => coverArtInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <span className="text-lg font-medium">Select Cover Art</span>
                      <span className="text-sm text-muted-foreground">3000 x 3000 pixels (1:1 Ratio)</span>
                    </div>
                  </Button>
                </>
              ) : (
                <div className="relative group">
                  <img src={coverArtPreview!} alt="Cover ART" className="w-full aspect-square rounded-lg object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeCoverArt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 2: The Music */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">The Music</h2>
              <p className="text-xs text-muted-foreground">Upload tracks for your {releaseType}</p>
            </div>

            <Card className="p-4">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/wav,audio/flac"
                multiple
                onChange={handleAudioSelect}
                className="hidden"
              />

              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-2 p-2 border rounded-lg bg-secondary/10 group">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Input
                        value={track.title}
                        onChange={(e) => updateTrackField(track.id, 'title', e.target.value)}
                        className="h-8 text-sm font-medium bg-transparent border-none focus-visible:ring-1"
                        placeholder="Song Title"
                      />
                      <p className="text-[10px] text-muted-foreground px-1 truncate">
                        {track.file?.name} • {formatFileSize(track.file?.size || 0)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTrack(track.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-16 border-dashed"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Add Tracks</span>
                    <span className="text-[10px] text-muted-foreground">WAV or FLAC</span>
                  </div>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Distribution */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Distribution</h2>
              <p className="text-xs text-muted-foreground">Platforms and release settings</p>
            </div>

            <Card className="p-4 space-y-3">
              <div>
                <Label htmlFor="releaseDate">Release Date *</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="English"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Recording Year</Label>
                  <Input
                    id="year"
                    value={recordingYear}
                    onChange={(e) => setRecordingYear(e.target.value)}
                    placeholder="YYYY"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="label">Label Name</Label>
                <Input
                  id="label"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="Enter label name (Optional)"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Existing Release?</Label>
                    <div className="text-sm text-muted-foreground">Do you have an existing UPC?</div>
                  </div>
                  <Switch
                    checked={isExistingRelease}
                    onCheckedChange={setIsExistingRelease}
                  />
                </div>

                {isExistingRelease && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="upc">UPC Code *</Label>
                    <Input
                      id="upc"
                      value={upc}
                      onChange={(e) => setUpc(e.target.value)}
                      placeholder="Enter UPC"
                      required
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Distribution Platforms</h3>
                  <p className="text-xs text-muted-foreground">Select stores for your music</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedPlatforms.length === DISTRIBUTION_PLATFORMS.length) {
                      setSelectedPlatforms([]);
                    } else {
                      setSelectedPlatforms([...DISTRIBUTION_PLATFORMS]);
                    }
                  }}
                >
                  {selectedPlatforms.length === DISTRIBUTION_PLATFORMS.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {DISTRIBUTION_PLATFORMS.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform]);
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                        }
                      }}
                    />
                    <Label htmlFor={platform} className="font-normal cursor-pointer text-sm">
                      {platform}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Track Credits */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Track Credits</h2>
              <p className="text-xs text-muted-foreground">Individual details for each song</p>
            </div>

            <div className="space-y-3">
              {tracks.map((track, index) => (
                <Card key={track.id} className="p-3 space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-5 text-[10px]">{index + 1}</Badge>
                      <h3 className="font-bold truncate max-w-[200px] text-sm">{track.title}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <DynamicTextField
                        label="Featured Artist"
                        values={track.featuredArtists}
                        onChange={(val) => updateTrackField(track.id, 'featuredArtists', val)}
                        placeholder="e.g. Burna Boy"
                      />
                    </div>
                    <div>
                      <DynamicTextField
                        label="Producer"
                        values={track.producers}
                        onChange={(val) => updateTrackField(track.id, 'producers', val)}
                        placeholder="e.g. Kel-P"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Songwriter Legal Name(s) *</Label>
                    <Input
                      value={track.legalName}
                      onChange={(e) => updateTrackField(track.id, 'legalName', e.target.value)}
                      placeholder="Full Name (e.g. John Doe)"
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Lyrics</Label>
                    <Textarea
                      value={track.lyrics}
                      onChange={(e) => updateTrackField(track.id, 'lyrics', e.target.value)}
                      placeholder="Enter lyrics here..."
                      className="h-20 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs">Explicit Content?</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={track.trackType === "clean" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateTrackField(track.id, 'trackType', "clean")}
                          className="flex-1 h-7 text-[10px]"
                        >
                          Clean
                        </Button>
                        <Button
                          type="button"
                          variant={track.trackType === "explicit" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateTrackField(track.id, 'trackType', "explicit")}
                          className="flex-1 h-7 text-[10px]"
                        >
                          Explicit
                        </Button>
                      </div>
                    </div>
                    {isExistingRelease && (
                      <div className="flex-1">
                        <Label className="text-xs">ISRC Code</Label>
                        <Input
                          value={track.isrc || ""}
                          onChange={(e) => updateTrackField(track.id, 'isrc', e.target.value)}
                          placeholder="ISRC"
                          className="h-7 text-[10px]"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-yellow-600 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-yellow-700">Quick Artist Tool</p>
                  <p>Common legal name for all tracks?</p>
                  <Input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Enter legal name to apply to all"
                    className="mt-2 h-8"
                  />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-1"
                    onClick={() => setTracks(prev => prev.map(t => ({ ...t, legalName: legalName })))}
                  >
                    Apply to all tracks
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Review Release</h2>
              <p className="text-xs text-muted-foreground">Double check everything before submitting</p>
            </div>

            <Card className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <img src={coverArtPreview || "/placeholder.svg"} className="w-24 h-24 rounded-lg object-cover bg-muted" />
                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold">{releaseTitle || "Untitled Release"}</h3>
                  <p className="text-base text-muted-foreground">{artistName || "Unknown Artist"}</p>
                  <p className="text-xs font-medium pt-1">{releaseType} • {tracks.length} track(s)</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                {tracks.map((track, idx) => (
                  <div key={track.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0 border-muted/20">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                      <span className="font-medium">{track.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {track.trackType === "explicit" && <Badge variant="destructive" className="h-4 text-[8px] px-1">E</Badge>}
                      <span>{Math.floor((track.duration || 0) / 60)}:{((track.duration || 0) % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Release Date</span>
                  <p className="font-medium">{releaseDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Primary Genre</span>
                  <p className="font-medium">{selectedGenres[0] || customGenre}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Language</span>
                  <p className="font-medium">{language}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Copyright</span>
                  <p className="font-medium">{copyrightHolder || artistName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Platforms</span>
                  <p className="font-medium">{selectedPlatforms.length} Selected</p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Uploading...
                    </span>
                    <span className="font-bold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {uploadError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm mt-4">
                  {uploadError}
                  <Button
                    type="button"
                    variant="link"
                    className="text-red-700 underline ml-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-3 border-t pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="flex-1"
          >
            Back
          </Button>

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
              className="flex-1"
            >
              {isSubmitting ? "Uploading..." : "Submit Release"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
