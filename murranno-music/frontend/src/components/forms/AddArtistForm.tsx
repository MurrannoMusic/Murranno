import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface NewArtist {
  name: string;
  stageName: string;
  email?: string;
  revenueShare?: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  notes?: string;
}

interface AddArtistFormProps {
  onAdd: (artist: NewArtist) => void;
  onCancel: () => void;
  isLabel?: boolean;
}

export const AddArtistForm = ({ onAdd, onCancel, isLabel = false }: AddArtistFormProps) => {
  const [newArtist, setNewArtist] = useState<NewArtist>({ 
    name: '', 
    stageName: '', 
    email: '',
    revenueShare: 50,
    notes: ''
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = () => {
    if (newArtist.name && newArtist.stageName) {
      const artistData: NewArtist = {
        name: newArtist.name,
        stageName: newArtist.stageName,
        email: newArtist.email || undefined,
        ...(isLabel && {
          revenueShare: newArtist.revenueShare,
          contractStartDate: startDate,
          contractEndDate: endDate,
          notes: newArtist.notes
        })
      };
      
      onAdd(artistData);
      setNewArtist({ name: '', stageName: '', email: '', revenueShare: 50, notes: '' });
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  return (
    <DialogContent className="mobile-container glass-card border-border/20 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Artist</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div>
          <Label htmlFor="artistName">Artist Name</Label>
          <Input
            id="artistName"
            placeholder="Real name"
            value={newArtist.name}
            onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="stageName">Stage Name</Label>
          <Input
            id="stageName"
            placeholder="Performance name"
            value={newArtist.stageName}
            onChange={(e) => setNewArtist({...newArtist, stageName: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email {isLabel ? '(To invite existing artist)' : '(Optional)'}</Label>
          <Input
            id="email"
            type="email"
            placeholder="artist@example.com"
            value={newArtist.email}
            onChange={(e) => setNewArtist({...newArtist, email: e.target.value})}
          />
        </div>

        {isLabel && (
          <>
            <div>
              <Label htmlFor="revenueShare">Revenue Share Percentage</Label>
              <Input
                id="revenueShare"
                type="number"
                min="0"
                max="100"
                value={newArtist.revenueShare}
                onChange={(e) => setNewArtist({...newArtist, revenueShare: parseInt(e.target.value) || 0})}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Artist receives this % of earnings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contract Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Contract End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newArtist.notes}
                onChange={(e) => setNewArtist({...newArtist, notes: e.target.value})}
                placeholder="Add any relevant notes about this artist..."
                rows={3}
              />
            </div>
          </>
        )}
        
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleSubmit}
            className="flex-1 gradient-primary"
          >
            Add Artist
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
