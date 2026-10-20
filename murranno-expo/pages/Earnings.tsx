import React, { useState, useMemo, useRef } from 'react';
import { CardSkeleton, EmptyState, ErrorState, ListSkeleton, NoResults, Skeleton, StatSkeleton, SuccessState, friendlyError } from '@/components/states/StateViews';
import { FormError, FormField } from '@/components/forms/FormField';
import { accountNumber as accountNumberRule } from '@/lib/validation';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Modal, TextInput,
    FlatList,
} from 'react-native';
import {
    Wallet, DollarSign, Clock, TrendingUp, ArrowUpRight,
    Plus, Star, Trash2, Settings, Filter, CheckCircle,
    Music, ChevronDown, AlertCircle,
    Eye, EyeOff, Landmark,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { invoke, confirmAction } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useWallet } from '@/hooks/useWallet';
import { usePayoutMethods } from '@/hooks/usePayoutMethods';
import { supabase } from '@/integrations/supabase/client';

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusColor = (status: string, colors: any) => {
    switch (status) {
        case 'paid':       return colors.success;
        case 'pending':    return colors.warning;
        case 'processing': return colors.primaryGlow;
        default:           return colors.mutedForeground;
    }
};

// ─── Add Bank Modal ───────────────────────────────────────────────────────────

interface Bank { id: number; name: string; code: string; }

const AddBankModal = ({
    visible, onClose, onSuccess, colors, isDark,
}: { visible: boolean; onClose: () => void; onSuccess: () => void; colors: any; isDark: boolean }) => {
    const [banks, setBanks]           = useState<Bank[]>([]);
    const [bankSearch, setBankSearch] = useState('');
    const [showBankList, setShowBankList] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName]   = useState('');
    const [verifying, setVerifying]       = useState(false);
    const [verified, setVerified]         = useState(false);
    const [saving, setSaving]             = useState(false);
    const [errors, setErrors]             = useState<{ bank?: string; account?: string; form?: string }>({});
    const [banksError, setBanksError]     = useState<unknown>(null);
    const [added, setAdded]               = useState(false);

    React.useEffect(() => {
        if (visible) fetchBanks();
    }, [visible]);

    React.useEffect(() => {
        let active = true;
        setVerified(false); setAccountName(''); setVerifying(false); setErrors({});
        if (accountNumber.length === 10 && selectedBank) {
            setVerifying(true);
            invoke('paystack-resolve-account', { account_number: accountNumber, bank_code: selectedBank.code })
                .then(data => { if (active) { setAccountName(data.data.account_name); setVerified(true); } })
                .catch(e => { if (active) setErrors({ account: friendlyError(e).kind === 'offline' ? friendlyError(e).message : 'We couldn’t find this account at the selected bank. Check the number and bank.' }); })
                .finally(() => { if (active) setVerifying(false); });
        }
        return () => { active = false; };
    }, [accountNumber, selectedBank]);

    const fetchBanks = async () => {
        try {
            setBanksError(null);
            const data = await invoke('paystack-get-banks');
            if (data?.success) setBanks(data.data || []);
        } catch (err) {
            setBanksError(err);
        }
    };

    const handleSubmit = async () => {
        const found = { bank: selectedBank ? undefined : 'Choose your bank', account: accountNumberRule(accountNumber) || (!verifying && !verified ? 'We couldn’t verify this account yet. Check the number.' : undefined) };
        setErrors(found);
        if (found.bank || found.account || !verified || !selectedBank) return;
        try {
            setSaving(true);
            const { data, error } = await supabase.functions.invoke('paystack-create-recipient', {
                body: {
                    account_name: accountName,
                    account_number: accountNumber,
                    bank_code: selectedBank.code,
                    bank_name: selectedBank.name,
                },
            });
            if (error) throw error;
            if (data?.success) {
                onSuccess();
                setAdded(true);
            } else throw new Error(data?.error || 'Bank account not saved');
        } catch (err: any) {
            setErrors({ form: friendlyError(err).message });
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedBank(null);
        setBankSearch('');
        setAccountNumber('');
        setAccountName('');
        setVerified(false);
        setShowBankList(false);
        setErrors({});
        setAdded(false);
        onClose();
    };

    const filteredBanks = banks.filter((b) =>
        b.name.toLowerCase().includes(bankSearch.toLowerCase()),
    );

    const s = makeStyles(colors, isDark);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={s.modalOverlay}>
                <View style={[s.modalSheet, {maxHeight: '90%'}]}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={s.modalHandle} />
                    {added ? (
                        <SuccessState title="Bank account added" body={`${accountName} · ${accountNumber}\nFor your security, withdrawals are paused for 24 hours after adding bank details.`} action={{ label: 'Done', onPress: handleClose }} />
                    ) : <>
                    <Text style={s.modalTitle}>Add Bank Account</Text>

                    {/* Bank Selector */}
                    <Text style={s.inputLabel}>Bank</Text>
                    {banksError ? <ErrorState error={banksError} title="Couldn’t load the list of banks" onRetry={fetchBanks} style={{ paddingVertical: 16 }} /> : <>
                    <Pressable accessibilityRole="button" accessibilityLabel={selectedBank ? `Bank: ${selectedBank.name}. Change` : 'Select your bank'} style={[s.selector, !!errors.bank && { borderColor: colors.destructive }]} onPress={() => setShowBankList(!showBankList)}>
                        <Text style={[s.selectorText, !selectedBank && { color: colors.mutedForeground }]}>
                            {selectedBank ? selectedBank.name : 'Select your bank'}
                        </Text>
                        <ChevronDown size={16} color={colors.mutedForeground} />
                    </Pressable>

                    {showBankList && (
                        <View style={s.bankDropdown}>
                            <TextInput
                                style={s.bankSearch}
                                placeholder="Search banks..."
                                placeholderTextColor={colors.mutedForeground}
                                value={bankSearch}
                                onChangeText={setBankSearch}
                            />
                            {filteredBanks.length === 0 && <Text style={{ padding: 12, color: colors.mutedForeground, fontSize: 13 }}>No banks match “{bankSearch}”.</Text>}
                            <FlatList
                                data={filteredBanks}
                                keyExtractor={(b) => String(b.id)}
                                style={{ maxHeight: 180 }}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={s.bankItem}
                                        onPress={() => {
                                            setSelectedBank(item);
                                            setShowBankList(false);
                                            setBankSearch('');
                                            setErrors({});
                                        }}
                                    >
                                        <Text style={s.bankItemText}>{item.name}</Text>
                                    </Pressable>
                                )}
                            />
                        </View>
                    )}
                    </>}
                    {!!errors.bank && <Text accessibilityRole="alert" style={{ color: colors.destructive, fontSize: 12, marginTop: 6 }}>{errors.bank}</Text>}

                    {/* Account Number */}
                    <Text style={[s.inputLabel, { marginTop: 16 }]}>Account Number</Text>
                    <View style={s.inputRow}>
                        <TextInput
                            accessibilityLabel="Account number"
                            style={[s.input, { flex: 1 }, !!errors.account && { borderColor: colors.destructive }]}
                            placeholder="Enter 10-digit account number"
                            placeholderTextColor={colors.mutedForeground}
                            value={accountNumber}
                            onChangeText={(v) => setAccountNumber(v.replace(/\D/g, '').slice(0, 10))}
                            keyboardType="numeric"
                        />
                        {verifying && <ActivityIndicator size="small" color={colors.primaryGlow} style={{ marginLeft: 8 }} />}
                        {verified && <CheckCircle size={18} color={colors.success} style={{ marginLeft: 8 }} />}
                    </View>
                    {!!errors.account && <Text accessibilityRole="alert" style={{ color: colors.destructive, fontSize: 12, marginTop: 6 }}>{errors.account}</Text>}

                    {/* Verified Name */}
                    {accountName !== '' && (
                        <View style={s.verifiedBox}>
                            <CheckCircle size={14} color={colors.success} />
                            <Text style={s.verifiedText}>{accountName}</Text>
                        </View>
                    )}

                    <View style={{ marginTop: 12 }}><FormError message={errors.form} /></View>
                    <Pressable
                        accessibilityRole="button"
                        style={[s.submitBtn, (saving || verifying) && { opacity: 0.5 }]}
                        onPress={handleSubmit}
                        disabled={saving || verifying}
                    >
                        {saving
                            ? <ActivityIndicator color={colors.onPrimary} size="small" />
                            : <Text style={s.submitBtnText}>Add Bank Account</Text>
                        }
                    </Pressable>

                    <Pressable style={s.cancelBtn} onPress={handleClose}>
                        <Text style={s.cancelBtnText}>Cancel</Text>
                    </Pressable>
                    </>}
                </ScrollView></View>
            </View>
        </Modal>
    );
};

// ─── Withdraw Modal ───────────────────────────────────────────────────────────

const WithdrawModal = ({
    visible, onClose, availableBalance, onSuccess, colors, isDark,
}: {
    visible: boolean; onClose: () => void; availableBalance: number;
    onSuccess?: () => void; colors: any; isDark: boolean;
}) => {
    const [amount, setAmount]               = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [pin, setPin] = useState('');
    const idempotency = useRef<string | null>(null);
    React.useEffect(() => { idempotency.current = null; }, [amount, selectedMethod]);
    const [loading, setLoading]             = useState(false);
    const [errors, setErrors]               = useState<{ amount?: string; method?: string; pin?: string; form?: string }>({});
    const [result, setResult]               = useState<{ status?: string; scheduled_for?: string | null; message?: string } | null>(null);
    const { payoutMethods, refetch: refreshWithdrawalMethods, error: payoutError, loading: methodsLoading } = usePayoutMethods();
    React.useEffect(() => { if (visible) void refreshWithdrawalMethods(); }, [visible, refreshWithdrawalMethods]);

    const withdrawalAmount = parseFloat(amount) || 0;
    const fee = withdrawalAmount >= 5000 ? 50 : withdrawalAmount > 0 ? 25 : 0;
    const netAmount = withdrawalAmount - fee;
    const exceedsBalance = withdrawalAmount > availableBalance;

    const s = makeStyles(colors, isDark);

    const handleClose = () => {
        setAmount('');
        setSelectedMethod('');
        setPin(''); idempotency.current = null;
        setErrors({}); setResult(null);
        onClose();
    };

    const handleWithdraw = async () => {
        const found = {
            amount: !amount || withdrawalAmount <= 0 ? 'Enter how much you want to withdraw'
                : exceedsBalance ? `You can withdraw up to ₦${Number(availableBalance).toLocaleString('en-NG')}`
                : netAmount <= 0 ? 'The amount must be more than the processing fee' : undefined,
            method: selectedMethod ? undefined : 'Choose the bank account to pay into',
            pin: /^\d{4}$/.test(pin) ? undefined : 'Enter your 4-digit transaction PIN',
        };
        setErrors(found);
        if (found.amount || found.method || found.pin) return;
        try {
            setLoading(true);
            idempotency.current ||= `withdraw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
            const data = await invoke('paystack-initiate-withdrawal', { payout_method_id: selectedMethod, amount: withdrawalAmount, pin, idempotency_key: idempotency.current, description: 'Withdrawal from wallet' });
            if (data?.success) {
                setResult({ ...(data.data ?? {}), message: data.message });
                onSuccess?.();
            } else {
                throw new Error(data?.error || 'Failed to initiate withdrawal');
            }
        } catch (err: any) {
            const info = friendlyError(err);
            if (/pin/i.test(err?.message ?? '')) setErrors({ pin: err.message });
            else setErrors({ form: info.kind === 'unknown' ? (err?.message || 'Your withdrawal didn’t go through. Please try again.') : info.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={s.modalOverlay}>
                <View style={[s.modalSheet, {maxHeight: '90%'}]}><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={s.modalHandle} />
                    {result ? (
                        <SuccessState
                            title={result.status === 'pending_delay' ? 'Withdrawal scheduled' : result.status === 'pending_review' ? 'Withdrawal submitted for review' : 'Withdrawal on its way'}
                            body={result.status === 'pending_delay'
                                ? `For your security it will be sent ${result.scheduled_for ? `on ${new Date(result.scheduled_for).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}` : 'within 12 hours'}. We’ll email you when it’s paid.`
                                : result.status === 'pending_review'
                                    ? 'Larger withdrawals are checked by our team first. We’ll email you as soon as it’s approved and sent.'
                                    : 'We’ve sent it to your bank. It usually arrives within minutes, and we’ll email you when it lands.'}
                            action={{ label: 'Done', onPress: handleClose }}
                        />
                    ) : <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={s.modalTitle}>Withdraw Funds</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={[s.plusBtn, { width: 36, height: 36 }]} onPress={handleClose}>
                            <Text style={{ fontSize: 18, color: colors.foreground, lineHeight: 18 }}>×</Text>
                        </Pressable>
                    </View>

                    {/* Available Balance */}
                    <View style={{ backgroundColor: `${colors.primaryGlow}18`, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: `${colors.primaryGlow}30`, marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 4 }}>Available Balance</Text>
                        <Text style={{ fontSize: 28, fontWeight: '600', color: colors.foreground }}>₦{Number(availableBalance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                    </View>

                    {/* Amount */}
                    <Text style={s.inputLabel}>Withdrawal Amount</Text>
                    <View style={[s.inputRow, { marginBottom: 4 }]}>
                        <Text style={{ position: 'absolute', left: 14, fontSize: 16, color: colors.mutedForeground, zIndex: 1 }}>₦</Text>
                        <TextInput
                            accessibilityLabel="Withdrawal amount"
                            style={[s.input, { flex: 1, paddingLeft: 28, fontSize: 18, fontWeight: '700' }, (!!errors.amount || exceedsBalance) && { borderColor: colors.destructive }]}
                            placeholder="0.00"
                            placeholderTextColor={colors.mutedForeground}
                            value={amount}
                            onChangeText={(v) => { setAmount(v.replace(/[^0-9.]/g, '')); setErrors({}); }}
                            keyboardType="decimal-pad"
                        />
                    </View>
                    {(!!errors.amount || exceedsBalance) && (
                        <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                            <AlertCircle size={14} color={colors.destructive} />
                            <Text style={{ fontSize: 12, color: colors.destructive }}>{errors.amount ?? `You can withdraw up to ₦${Number(availableBalance).toLocaleString('en-NG')}`}</Text>
                        </View>
                    )}

                    {/* Payout Method */}
                    <Text style={[s.inputLabel, { marginTop: 8 }]}>Payout Method</Text>
                    {payoutError && !payoutMethods.length ? <ErrorState error={payoutError} title="Couldn’t load your bank accounts" onRetry={refreshWithdrawalMethods} style={{ paddingVertical: 16 }} />
                    : methodsLoading && !payoutMethods.length ? <ListSkeleton rows={2} media={false} /> : payoutMethods.length === 0 ? (
                        <EmptyState icon={Landmark} title="No bank account yet" body="Add a bank account in the Methods tab to withdraw your earnings." style={{ paddingVertical: 16 }} />
                    ) : (
                        <View style={{ marginBottom: 16 }}>
                            {payoutMethods.map((m) => (
                                <Pressable
                                    key={m.id}
                                    accessibilityRole="radio" accessibilityLabel={`${m.bank_name} ending ${m.account_number.slice(-4)}`} accessibilityState={{checked:selectedMethod===m.id}} aria-checked={selectedMethod===m.id}
                                    style={[
                                        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6 },
                                        selectedMethod === m.id
                                            ? { borderColor: colors.primaryGlow, backgroundColor: `${colors.primaryGlow}18` }
                                            : { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                                    ]}
                                    onPress={() => { setSelectedMethod(m.id); setErrors({}); }}
                                >
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: selectedMethod === m.id ? colors.primaryGlow : colors.border }} />
                                    <Text style={{ flex: 1, fontSize: 13, color: colors.foreground, fontWeight: '500' }}>
                                        {m.bank_name} — {m.account_number}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                    {!!errors.method && <Text accessibilityRole="alert" style={{ color: colors.destructive, fontSize: 12, marginBottom: 12 }}>{errors.method}</Text>}

                    <Text style={s.inputLabel}>Transaction PIN</Text>
                    <FormField password accessibilityLabel="Transaction PIN" value={pin} onChangeText={value => { setPin(value.replace(/\D/g, '').slice(0, 4)); setErrors({}); }} maxLength={4} keyboardType="number-pad" placeholder="4-digit PIN" error={errors.pin} containerStyle={{ marginBottom: 16 }} />
                    {/* Fee breakdown */}
                    {withdrawalAmount > 0 && (
                        <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 14, padding: 14, gap: 8, marginBottom: 12 }}>
                            {[['Amount', `₦${withdrawalAmount.toFixed(2)}`], ['Processing Fee', `-₦${fee.toFixed(2)}`]].map(([l, v]) => (
                                <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{l}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: l === 'Processing Fee' ? colors.destructive : colors.foreground }}>{v}</Text>
                                </View>
                            ))}
                            <View style={{ height: 1, backgroundColor: colors.border }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>You&apos;ll Receive</Text>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.success }}>₦{netAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    {/* Processing time */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                        <Clock size={14} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Processing time: 1-3 business days</Text>
                    </View>

                    <View style={{ marginBottom: 12 }}><FormError message={errors.form} /></View>
                    <Pressable
                        style={[s.submitBtn, loading && { opacity: 0.5 }]}
                        accessibilityRole="button" accessibilityLabel="Confirm withdrawal"
                        onPress={handleWithdraw}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={colors.onPrimary} size="small" />
                            : <Text style={s.submitBtnText}>Confirm Withdrawal</Text>
                        }
                    </Pressable>
                    </>}
                </ScrollView></View>
            </View>
        </Modal>
    );
};

// ─── component ────────────────────────────────────────────────────────────────

export const Earnings = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { formatAmount: fmtCurrency } = useCurrency();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [activeTab, setActiveTab]         = useState<'balance' | 'methods' | 'history'>('balance');
    const [showAddBank, setShowAddBank]     = useState(false);
    const [showFilters, setShowFilters]     = useState(false);
    const [showWithdraw, setShowWithdraw]   = useState(false);
    const [showBalance, setShowBalance]     = useState(true);

    const { balance, loading: balLoading, refetch: refetchBalance, error: balanceError } = useWalletBalance();
    const { transactions, totalCount, earningsSources, statusFilter, setStatusFilter, setTypeFilter,
            loading: walLoading, error: walletError, refetch: refetchWallet } = useWallet();
    const { payoutMethods, loading: pmLoading, deleteMethod, setPrimary,
            refetch: refetchMethods, error: methodsError } = usePayoutMethods();
    const { profile } = useArtistProfile();

    const handleWithdrawPress = async () => {
        if (profile?.kyc_status !== 'verified') {
            if (await confirmAction('Verification required', 'Verify your identity before withdrawing. Open verification?')) router.push('/app/kyc' as any);
            return;
        }
        setShowWithdraw(true);
    };
    const TABS = [
        { id: 'balance', label: 'Balance' },
        { id: 'methods', label: 'Payout Methods' },
        { id: 'history', label: 'History' },
    ] as const;

    const txStatusColor = (s: string) => statusColor(s, colors);

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader showCurrencyToggle />

            <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: '700', letterSpacing: -1, marginHorizontal: 24, marginBottom: 20 }}>Earnings</Text>
            {/* Tab Bar */}
            <View style={s.tabBar}>
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.id}
                        style={[s.tabBtn, activeTab === tab.id && s.tabBtnActive]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[s.tabBtnText, activeTab === tab.id && s.tabBtnTextActive]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ─── Balance Tab ───────────────────────────────────────── */}
                {activeTab === 'balance' && (
                    <>
                        {balLoading && !balance ? (
                            <View style={{ gap: 12 }}><Skeleton style={{ height: 190, borderRadius: 18 }} /><StatSkeleton /></View>
                        ) : balanceError && !balance ? (
                            <ErrorState error={balanceError} title="Couldn’t load your balance" onRetry={refetchBalance} />
                        ) : !balance || (balance.available_balance === 0 && balance.total_earnings === 0) ? (
                            <EmptyState icon={Wallet} title="No earnings yet" body="Royalties show up here once stores report streams of your music, usually 2–3 months after release." action={{ label: 'Upload music', to: '/app/upload' }} />
                        ) : (
                            <>
                                {/* Balance Card */}
                                <View style={s.balanceCard}>
                                    <View style={s.balanceCardTop}>
                                        <View>
                                            <Text style={s.availableLabel}>AVAILABLE BALANCE</Text>
                                            <Text style={s.balanceAmount}>
                                                                                                {showBalance
                                                    ? fmtCurrency(balance.available_balance)
                                                    : '••••••'
                                                }
                                            </Text>
                                        </View>
                                        <Pressable style={s.balanceDollarBadge} onPress={() => setShowBalance(!showBalance)}>
                                            {showBalance ? <Eye size={20} color={colors.primaryGlow} /> : <EyeOff size={20} color={colors.primaryGlow} />}
                                        </Pressable>
                                    </View>

                                    <View style={s.balanceMeta}>
                                        <View>
                                            <View style={s.metaRow}>
                                                <Clock size={10} color={colors.mutedForeground} />
                                                <Text style={s.metaLabel}> PENDING</Text>
                                            </View>
                                            <Text style={s.metaValue}>{fmtCurrency(balance.pending_balance)}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <View style={s.metaRow}>
                                                <ArrowUpRight size={10} color={colors.mutedForeground} />
                                                <Text style={s.metaLabel}> TOTAL EARNED</Text>
                                            </View>
                                            <Text style={s.metaValue}>{fmtCurrency(balance.total_earnings)}</Text>
                                        </View>
                                    </View>

                                    <View style={s.balanceBtns}>
                                        <Pressable accessibilityRole="button" accessibilityLabel="Withdraw funds" style={s.withdrawBtn} onPress={handleWithdrawPress}>
                                            <Text style={s.withdrawBtnText}>Withdraw Funds</Text>
                                        </Pressable>
                                        <Pressable accessibilityRole="button" accessibilityLabel="Add payout account" style={s.plusBtn} onPress={() => setShowAddBank(true)}>
                                            <Plus size={18} color={colors.foreground} />
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Stat Cards */}
                                <View style={s.statRow}>
                                    <View style={s.statCard}>
                                        <View style={s.statCardTop}>
                                            <View style={[s.statIcon, { backgroundColor: `${colors.primaryGlow}22` }]}>
                                                <DollarSign size={14} color={colors.primaryGlow} />
                                            </View>
                                        </View>
                                        <Text style={s.statValue}>{fmtCurrency(balance.total_earnings)}</Text>
                                        <Text style={s.statLabel}>TOTAL EARNINGS</Text>
                                    </View>
                                    <View style={s.statCard}>
                                        <View style={s.statCardTop}>
                                            <View style={[s.statIcon, { backgroundColor: `${colors.primaryGlow}22` }]}>
                                                <TrendingUp size={14} color={colors.primaryGlow} />
                                            </View>
                                        </View>
                                        <Text style={s.statValue}>{fmtCurrency(balance.pending_balance)}</Text>
                                        <Text style={s.statLabel}>PENDING ROYALTIES</Text>
                                    </View>
                                </View>

                                {/* Earnings Sources */}
                                {earningsSources.length > 0 && (
                                    <View style={s.sourcesCard}>
                                        <Text style={s.sourcesTitle}>EARNINGS BY SOURCE</Text>
                                        {earningsSources.map((src) => (
                                            <View key={src.id} style={s.sourceRow}>
                                                <View style={s.sourceIcon}>
                                                    <Music size={18} color={colors.primaryGlow} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={s.sourceTopRow}>
                                                        <Text style={s.sourcePlatform}>{src.platform}</Text>
                                                        <Text style={s.sourceAmount}>{fmtCurrency(src.amount)}</Text>
                                                    </View>
                                                    <Text style={s.sourceStreams}>
                                                        {src.streams == null ? 'Reported royalties' : `${src.streams.toLocaleString()} streams`}
                                                    </Text>
                                                </View>
                                                <Text style={[s.sourceGrowth, { color: (src.growth ?? 0) >= 0 ? colors.success : colors.destructive }]}>
                                                    {src.growth == null ? '' : `${src.growth >= 0 ? '+' : ''}${src.growth}%`}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* ─── Payout Methods Tab ─────────────────────────────────── */}
                {activeTab === 'methods' && (
                    <>
                        {pmLoading && !payoutMethods.length ? (
                            <CardSkeleton lines={3} />
                        ) : methodsError && !payoutMethods.length ? (
                            <ErrorState error={methodsError} title="Couldn’t load your bank accounts" onRetry={refetchMethods} />
                        ) : (
                            <>
                                {/* Methods Card */}
                                <View style={s.card}>
                                    <View style={s.cardHeader}>
                                        <Text style={s.cardTitle}>Your Payout Methods</Text>
                                        <Pressable
                                            style={s.addBtn}
                                            onPress={() => setShowAddBank(true)}
                                        >
                                            <Plus size={14} color={colors.onPrimary} />
                                            <Text style={s.addBtnText}>Add</Text>
                                        </Pressable>
                                    </View>

                                    {payoutMethods.length === 0 ? (
                                        <EmptyState icon={Landmark} title="No bank account yet" body="Add the Nigerian bank account you want your earnings paid into." action={{ label: 'Add bank account', onPress: () => setShowAddBank(true) }} />
                                    ) : (
                                        payoutMethods.map((method) => (
                                            <View key={method.id} style={s.methodItem}>
                                                <View style={s.methodAvatar}>
                                                    <Text style={s.methodAvatarText}>
                                                        {method.bank_name.charAt(0)}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={s.methodBankName}>{method.bank_name}</Text>
                                                        {method.is_primary && (
                                                            <Star size={14} color={colors.accent} fill={colors.accent} />
                                                        )}
                                                    </View>
                                                    <Text style={s.methodAccName}>{method.account_name}</Text>
                                                    <Text style={s.methodAccNum}>{method.account_number}</Text>
                                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                                        {method.is_verified && (
                                                            <View style={s.verifiedPill}>
                                                                <Text style={s.verifiedPillText}>Verified</Text>
                                                            </View>
                                                        )}
                                                        <Text style={s.methodCurrency}>{method.currency}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ gap: 4 }}>
                                                    {!method.is_primary && (
                                                        <Pressable style={s.methodAction} onPress={() => setPrimary(method.id)}>
                                                            <Star size={16} color={colors.mutedForeground} />
                                                        </Pressable>
                                                    )}
                                                    <Pressable style={s.methodAction} onPress={() => deleteMethod(method.id)}>
                                                        <Trash2 size={16} color={colors.destructive} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>

                                {/* Manage Card */}
                                <View style={[s.card, { flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.cardTitle}>Manage your payout methods</Text>
                                        <Text style={s.cardSubtitle}>Update details, verify accounts, or add new methods</Text>
                                    </View>
                                    <Pressable style={s.settingsBtn} onPress={() => setShowAddBank(true)}>
                                        <Settings size={18} color={colors.mutedForeground} />
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </>
                )}

                {/* ─── History Tab ────────────────────────────────────────── */}
                {activeTab === 'history' && (
                    <>
                        {/* Filters */}
                        <View style={s.card}>
                            <View style={[s.cardHeader, { marginBottom: 0 }]}>
                                <Text style={s.cardTitle}>Filters</Text>
                                <Pressable onPress={() => setShowFilters(!showFilters)}>
                                    <Filter size={18} color={colors.mutedForeground} />
                                </Pressable>
                            </View>
                            {showFilters && (
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                    {/* Status filter pills */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                                        {['all', 'paid', 'pending', 'processing'].map((v) => (
                                            <Pressable
                                                key={v}
                                                style={[s.filterPill, statusFilter === v && s.filterPillActive]}
                                                onPress={() => setStatusFilter(v)}
                                            >
                                                <Text style={[s.filterPillText, statusFilter === v && s.filterPillTextActive]}>
                                                    {v === 'all' ? 'All Status' : v.charAt(0).toUpperCase() + v.slice(1)}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Transaction History */}
                        <View style={s.card}>
                            <Text style={[s.cardTitle, { marginBottom: 12 }]}>Transaction History</Text>
                            {/* Header row */}
                            <View style={s.txHeader}>
                                {['Payout', 'Type', 'Requested', 'Status'].map((col) => (
                                    <Text key={col} style={[s.txHeaderCell, col === 'Status' && { textAlign: 'right' }]}>{col}</Text>
                                ))}
                            </View>
                            {walLoading && !totalCount ? (
                                <ListSkeleton rows={4} media={false} />
                            ) : walletError && !totalCount ? (
                                <ErrorState error={walletError} title="Couldn’t load your transactions" onRetry={refetchWallet} />
                            ) : totalCount === 0 ? (
                                <EmptyState icon={Clock} title="No transactions yet" body="Royalty credits and withdrawals will be listed here." />
                            ) : transactions.length === 0 ? (
                                <NoResults what="transactions" onClear={() => { setStatusFilter('all'); setTypeFilter('all'); }} />
                            ) : (
                                transactions.map((tx, i) => (
                                    <View key={tx.id} style={[s.txRow, i < transactions.length - 1 && s.txRowBorder]}>
                                        <Text style={s.txCell} numberOfLines={1}>{fmtCurrency(tx.amount)}</Text>
                                        <Text style={s.txCell} numberOfLines={1}>{tx.type}</Text>
                                        <Text style={s.txCell} numberOfLines={1}>
                                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                        <View style={[s.txStatusBadge, { backgroundColor: `${txStatusColor(tx.status)}22` }]}>
                                            <Text style={[s.txStatusText, { color: txStatusColor(tx.status) }]}>
                                                {tx.status}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <AddBankModal
                visible={showAddBank}
                onClose={() => setShowAddBank(false)}
                onSuccess={() => { refetchMethods(); }}
                colors={colors}
                isDark={isDark}
            />

            <WithdrawModal
                visible={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                availableBalance={balance?.available_balance ?? 0}
                onSuccess={() => { refetchBalance(); refetchWallet(); }}
                colors={colors}
                isDark={isDark}
            />
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
        screen:  { flex: 1, backgroundColor: colors.background },
        scroll:  { flex: 1 },
        scrollContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, gap: 14, paddingTop: 4 },
        centred: { padding: 48, alignItems: 'center' },

        // Tab bar
        tabBar: {
            flexDirection: 'row', marginHorizontal: 24, marginBottom: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            borderRadius: 14, padding: 3,
        },
        tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
        tabBtnActive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        tabBtnText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
        tabBtnTextActive: { color: colors.foreground },

        // Balance card
        balanceCard: {
            paddingVertical: 12,
            backgroundColor: colors.background,
        },
        balanceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
        availableLabel: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.8, marginBottom: 4 },
        balanceAmount:  { fontSize: 32, fontWeight: '600', color: colors.foreground },
        balanceCurrency:{ fontSize: 20, fontWeight: '500', color: colors.mutedForeground },
        balanceDollarBadge: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 8,
        },
        balanceMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
        metaRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        metaLabel:{ fontSize: 10, fontWeight: '600', color: colors.mutedForeground, letterSpacing: 0.5 },
        metaValue:{ fontSize: 14, fontWeight: '700', color: colors.foreground },
        balanceBtns: { flexDirection: 'row', gap: 8 },
        withdrawBtn: {
            flex: 1, backgroundColor: colors.foreground, borderRadius: 12,
            paddingVertical: 12, alignItems: 'center',
        },
        withdrawBtnText: { fontSize: 14, fontWeight: '700', color: colors.background },
        plusBtn: {
            width: 44, height: 44, borderRadius: 12,
            borderWidth: 1, borderColor: colors.border,
            justifyContent: 'center', alignItems: 'center',
        },

        // Stat cards
        statRow:  { flexDirection: 'row', gap: 12 },
        statCard: {
            flex: 1, paddingVertical: 14,
            borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
        },
        statCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
        statIcon:    { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
        statGrowth:  { fontSize: 10, fontWeight: '700', color: colors.success },
        statValue:   { fontSize: 17, fontWeight: '600', color: colors.foreground },
        statLabel:   { fontSize: 9, fontWeight: '600', color: colors.mutedForeground, letterSpacing: 0.5 },

        // Sources
        sourcesCard: {
            paddingVertical: 20,
            backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
        },
        sourcesTitle: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.8, marginBottom: 12 },
        sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
        sourceIcon: {
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: `${colors.primaryGlow}22`,
            justifyContent: 'center', alignItems: 'center',
        },
        sourceTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
        sourcePlatform: { fontSize: 13, fontWeight: '600', color: colors.foreground },
        sourceAmount:   { fontSize: 13, fontWeight: '700', color: colors.foreground },
        sourceStreams:  { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
        sourceGrowth:   { fontSize: 11, fontWeight: '600', marginLeft: 8 },

        // Generic card
        card: {
            paddingVertical: 20,
            backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
        },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
        cardTitle:  { fontSize: 16, fontWeight: '700', color: colors.foreground },
        cardSubtitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },

        // Add button
        addBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: colors.primaryGlow, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 6,
        },
        addBtnText: { fontSize: 13, fontWeight: '700', color: colors.onPrimary },

        // Methods empty
        methodsEmpty: { paddingVertical: 24, alignItems: 'center', gap: 12 },
        methodsEmptyText: { fontSize: 14, color: colors.mutedForeground },
        addFirstBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
        addFirstBtnText: { fontSize: 13, fontWeight: '600', color: colors.primaryGlow },

        // Method items
        methodItem: {
            flexDirection: 'row', alignItems: 'flex-start', gap: 12,
            paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border,
        },
        methodAvatar: {
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: `${colors.primaryGlow}22`,
            justifyContent: 'center', alignItems: 'center',
        },
        methodAvatarText: { fontSize: 16, fontWeight: '700', color: colors.primaryGlow },
        methodBankName:  { fontSize: 14, fontWeight: '600', color: colors.foreground },
        methodAccName:   { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
        methodAccNum:    { fontSize: 13, color: colors.mutedForeground },
        verifiedPill:    { backgroundColor: `${colors.success}22`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
        verifiedPillText:{ fontSize: 10, fontWeight: '600', color: colors.success },
        methodCurrency:  { fontSize: 10, color: colors.mutedForeground, alignSelf: 'center' },
        methodAction:    { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
        settingsBtn:     { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },

        // Filters
        filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
        filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        filterPillText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
        filterPillTextActive: { color: colors.onPrimary },

        // Transactions
        txHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: 8, marginBottom: 4 },
        txHeaderCell: { flex: 1, fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
        txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
        txRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
        txCell: { flex: 1, fontSize: 12, color: colors.foreground },
        txStatusBadge: { flex: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'flex-end' },
        txStatusText:  { fontSize: 10, fontWeight: '700' },

        // Empty state
        emptyCard: {
            borderRadius: 12, padding: 40, alignItems: 'center', gap: 10,
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        },
        emptyTitle:    { fontSize: 16, fontWeight: '700', color: colors.foreground },
        emptySubtitle: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },

        // Modal
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
        modalSheet: {
            backgroundColor: isDark ? '#0b1428' : colors.card,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, paddingBottom: 40,
        },
        modalHandle: {
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20,
        },
        modalTitle: { fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 20 },
        inputLabel: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
        selector: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        },
        selectorText: { fontSize: 14, color: colors.foreground },
        bankDropdown: {
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, marginTop: 4, overflow: 'hidden',
        },
        bankSearch: {
            paddingHorizontal: 14, paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            fontSize: 14, color: colors.foreground,
        },
        bankItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        bankItemText: { fontSize: 14, color: colors.foreground },
        inputRow: { flexDirection: 'row', alignItems: 'center' },
        input: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.foreground,
        },
        verifiedBox: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: `${colors.success}18`,
            borderWidth: 1, borderColor: `${colors.success}30`,
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8,
        },
        verifiedText: { fontSize: 13, fontWeight: '600', color: colors.success },
        submitBtn: {
            backgroundColor: colors.primaryGlow, borderRadius: 14,
            paddingVertical: 14, alignItems: 'center', marginTop: 20,
        },
        submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
        cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
        cancelBtnText: { fontSize: 14, fontWeight: '600', color: colors.mutedForeground },
    });
}
