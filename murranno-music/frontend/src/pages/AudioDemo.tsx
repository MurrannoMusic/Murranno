import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EnhancedAudioPlayer } from '@/components/audio/EnhancedAudioPlayer';
import { NativeAudioPlayer } from '@/components/audio/NativeAudioPlayer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Globe } from 'lucide-react';
import { isNativeApp } from '@/utils/platformDetection';

const AudioDemo = () => {
  // Sample audio URL - in real app, this would come from your data
  const sampleAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const isNative = isNativeApp();
  
  return (
    <PageContainer>
      <PageHeader title="Audio Player Demo" />
      
      <div className="flex items-center gap-2 mb-6">
        <Badge variant={isNative ? "default" : "secondary"} className="flex items-center gap-1">
          {isNative ? <Smartphone className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {isNative ? 'Native App' : 'Web App'}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {isNative ? 'Using native audio APIs' : 'Using HTML5 audio'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Native Audio Player (shows only in native app) */}
        {isNative && (
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Native Audio Player</h2>
                <Badge variant="default">Native</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Optimized for background playback and lock screen controls.
              </p>
              
              <NativeAudioPlayer
                audioUrl={sampleAudioUrl}
                trackTitle="Sample Track (Native)"
                artistName="Demo Artist"
                coverArt="https://picsum.photos/seed/audio1/200/200"
                assetId="demo-track-1"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Second Track (Native)</h2>
              <NativeAudioPlayer
                audioUrl={sampleAudioUrl}
                trackTitle="Second Track (Native)"
                artistName="Another Artist"
                coverArt="https://picsum.photos/seed/audio2/200/200"
                assetId="demo-track-2"
              />
            </Card>
          </>
        )}

        {/* Enhanced Audio Player (web fallback) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Enhanced Audio Player</h2>
            <Badge variant="secondary">HTML5</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tap the fullscreen button to enter landscape mode with audio visualizations and enhanced controls.
          </p>
          
          <EnhancedAudioPlayer
            audioUrl={sampleAudioUrl}
            trackTitle="Sample Track"
            artistName="Demo Artist"
            coverArt="https://picsum.photos/seed/audio1/200/200"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Another Track</h2>
          <EnhancedAudioPlayer
            audioUrl={sampleAudioUrl}
            trackTitle="Second Track"
            artistName="Another Artist"
            coverArt="https://picsum.photos/seed/audio2/200/200"
          />
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-semibold">Features</h3>
          
          {isNative && (
            <>
              <h4 className="text-sm font-semibold text-primary mt-4">Native Audio Player:</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Background audio playback (continues when app is minimized)</li>
                <li>Lock screen media controls</li>
                <li>Optimized for battery and performance</li>
                <li>Audio file preloading and caching</li>
                <li>Skip forward/backward 10 seconds</li>
                <li>Haptic feedback for all interactions</li>
              </ul>
            </>
          )}
          
          <h4 className="text-sm font-semibold text-primary mt-4">Enhanced Audio Player:</h4>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Compact player mode with essential controls</li>
            <li>Fullscreen landscape mode with real-time audio visualization</li>
            <li>Automatic screen orientation lock in fullscreen</li>
            <li>Haptic feedback for all interactions</li>
            <li>Skip forward/backward 10 seconds in fullscreen</li>
            <li>Beautiful gradient visualizations synced to audio</li>
            <li>Smooth animations and transitions</li>
            <li>Auto-pause when app goes to background</li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AudioDemo;
