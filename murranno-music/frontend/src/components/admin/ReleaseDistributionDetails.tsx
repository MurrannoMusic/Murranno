import { AdminRelease, AdminTrack } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Download, Music, ImageIcon, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ReleaseDistributionDetailsProps {
    release: AdminRelease;
    tracks: AdminTrack[];
}

export function ReleaseDistributionDetails({ release, tracks }: ReleaseDistributionDetailsProps) {
    const copyToClipboard = (text: string | null | undefined, label: string) => {
        if (!text) {
            toast.error(`No ${label} available to copy`);
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label}`);
    };

    const downloadFile = (url: string | null | undefined, filename: string) => {
        if (!url) {
            toast.error('File not available');
            return;
        }
        // simple open for now, specialized download might need ensuring Content-Disposition header or proxy
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                {release.cover_art_url ? (
                    <img
                        src={release.cover_art_url}
                        alt={release.title}
                        className="w-24 h-24 rounded-md object-cover shadow-sm"
                    />
                ) : (
                    <div className="w-24 h-24 bg-muted flex items-center justify-center rounded-md">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">{release.title}</h3>
                    <p className="text-muted-foreground">{release.primary_artist || 'Unknown Artist'}</p>
                    <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => downloadFile(release.cover_art_url, `${release.title}_cover.jpg`)}>
                            <Download className="h-4 w-4 mr-2" /> Download Cover
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="metadata" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="metadata">Release Metadata</TabsTrigger>
                    <TabsTrigger value="tracks">Tracks & Audio</TabsTrigger>
                </TabsList>

                <TabsContent value="metadata" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Details</CardTitle>
                            <CardDescription>Essential ID and copyright info</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>UPC / EAN</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.upc_ean || ''} placeholder="Not assigned" />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.upc_ean, 'UPC')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Record Label</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.label || ''} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.label, 'Label')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Genre</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.genre || ''} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.genre, 'Genre')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Release Date</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.release_date || ''} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.release_date, 'Date')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Copyright Line (C)</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.copyright || ''} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.copyright, 'Copyright')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Recording Year</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.recording_year || ''} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.recording_year, 'Year')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={release.language || 'English'} />
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(release.language, 'Language')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description / Liner Notes</Label>
                                <Input readOnly value={release.description || ''} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tracks" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracklist</CardTitle>
                            <CardDescription>Audio files and track-level metadata</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>ISRC</TableHead>
                                        <TableHead>Contributors</TableHead>
                                        <TableHead>Explicit</TableHead>
                                        <TableHead className="text-right">Assets</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tracks.map((track, index) => (
                                        <TableRow key={track.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {track.title}
                                                {track.lyrics && <FileText className="h-3 w-3 inline ml-2 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{track.isrc || '-'}</TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs" title={track.songwriter_legal_names?.join(', ')}>
                                                {track.songwriter_legal_names?.join(', ') || '-'}
                                            </TableCell>
                                            <TableCell>{track.explicit_content ? 'Yes' : 'No'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {track.audio_file_url && (
                                                        <Button size="sm" variant="secondary" onClick={() => downloadFile(track.audio_file_url, `${track.title}.mp3`)}>
                                                            <Download className="h-3 w-3 mr-1" /> Audio
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${track.title} - ${track.isrc}`, 'Track Meta')}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
