import { useState, useEffect } from 'react';
import { X, Lock, Loader2, Delete } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TransactionPinDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export const TransactionPinDialog = ({
    open,
    onClose,
    onSuccess,
    title = "Enter Transaction PIN",
    description = "Please enter your 4-digit security PIN to authorize this action.",
    loading = false
}: TransactionPinDialogProps) => {
    const [pin, setPin] = useState<string[]>([]);
    const { toast } = useToast();

    const handleKeyPress = (num: string) => {
        if (pin.length < 4) {
            setPin([...pin, num]);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        setPin([]);
    };

    useEffect(() => {
        if (pin.length === 4) {
            onSuccess(pin.join(''));
            setPin([]); // Clear for next time
        }
    }, [pin]);

    const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] rounded-[24px]">
                <DialogHeader className="items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">{description}</p>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center mt-6">
                    {/* PIN Indicators */}
                    <div className="flex gap-4 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-all duration-200",
                                    pin.length > i
                                        ? "bg-primary border-primary scale-110"
                                        : "border-muted-foreground/30"
                                )}
                            />
                        ))}
                    </div>

                    {/* NumPad */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                        {numPad.map((val, idx) => {
                            if (val === '') return <div key={`empty-${idx}`} />;
                            if (val === 'delete') {
                                return (
                                    <Button
                                        key="delete"
                                        variant="ghost"
                                        className="h-16 w-16 rounded-full flex items-center justify-center text-muted-foreground"
                                        onClick={handleDelete}
                                        disabled={loading || pin.length === 0}
                                    >
                                        <Delete className="h-6 w-6" />
                                    </Button>
                                );
                            }
                            return (
                                <Button
                                    key={val}
                                    variant="secondary"
                                    className="h-16 w-16 rounded-full text-2xl font-semibold bg-secondary/30 hover:bg-secondary/50 border border-transparent active:scale-95 transition-all"
                                    onClick={() => handleKeyPress(val)}
                                    disabled={loading || pin.length === 4}
                                >
                                    {val}
                                </Button>
                            );
                        })}
                    </div>

                    {loading && (
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground font-medium">Verifying PIN...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
