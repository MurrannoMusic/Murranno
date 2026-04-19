# Badge Notifications Setup Guide

Badge notifications display the unread notification count on your app icon, keeping users informed even when the app is closed.

## How It Works

The badge system automatically:
- Displays the current unread notification count on the app icon
- Updates in real-time as notifications are received or read
- Clears when all notifications are marked as read
- Works even when the app is closed or in the background

## Implementation Details

### 1. Badge Hook (`useBadgeCount.ts`)
The custom hook manages all badge operations:
- Checks platform support
- Requests permissions
- Updates badge count automatically
- Provides manual clear functionality

### 2. Integration with Notifications
The badge count is automatically synced with the notification system:
- `useNotifications` hook manages the unread count
- `useBadgeCount` hook updates the badge whenever unread count changes
- When notifications are marked as read, badge decrements automatically

### 3. Settings Management
Users can manage badge settings in the Settings page:
- View current badge count
- Grant/revoke badge permissions
- Manually clear the badge
- See how badges work

## Setup Instructions

### Step 1: Sync Capacitor
After pulling the latest code, sync Capacitor plugins:

```bash
npx cap sync
```

### Step 2: iOS Setup

**No additional configuration needed!** Badge support is built into iOS.

The app will automatically request badge permission when:
- User first receives a notification
- User enables push notifications in settings

### Step 3: Android Setup

**No additional configuration needed!** Badge support is handled by the plugin.

Some Android devices (Samsung, Xiaomi, OnePlus) may require additional permissions:
- These permissions are automatically requested by the plugin
- Users can grant them through device settings if needed

### Step 4: Test Badge Functionality

1. **Run the app on a device:**
   ```bash
   npx cap run ios
   # or
   npx cap run android
   ```

2. **Test badge updates:**
   - Open the app and allow notifications
   - Send a test notification from Admin → Notifications
   - Close the app completely
   - Badge should appear with count "1"
   - Open the app and read the notification
   - Badge should disappear

3. **Test manual clearing:**
   - Go to Settings → Badge Settings
   - Tap "Clear Badge" button
   - Badge should disappear from app icon

## API Reference

### useBadgeCount Hook

```typescript
const { clearBadge } = useBadgeCount(unreadCount);

// Manually clear badge
await clearBadge();
```

**Parameters:**
- `unreadCount: number` - The current unread notification count

**Returns:**
- `clearBadge: () => Promise<void>` - Function to manually clear the badge

### Badge Plugin Methods

The hook uses `@capawesome/capacitor-badge` plugin:

```typescript
// Check if badges are supported
const { isSupported } = await Badge.isSupported();

// Check permissions
const { display } = await Badge.checkPermissions();

// Request permissions
const result = await Badge.requestPermissions();

// Set badge count
await Badge.set({ count: 5 });

// Get current badge count
const { count } = await Badge.get();

// Clear badge
await Badge.clear();
```

## Platform-Specific Notes

### iOS
- **Always supported** on all iOS devices
- Requires notification permission to show badges
- Badge updates instantly
- Persists even after device restart

### Android
- **Support varies by manufacturer** and device model
- Some devices require special permissions (auto-granted by plugin)
- Badge appearance depends on launcher app
- Works best on stock Android and modern launchers

### Supported Android Launchers
- Stock Android Launcher
- Samsung One UI
- Google Pixel Launcher
- OnePlus OxygenOS
- Xiaomi MIUI (with proper permissions)
- Many third-party launchers

## Troubleshooting

### Badge Not Appearing

**iOS:**
1. Check that notification permissions are granted
2. Ensure the app is properly signed
3. Test on a physical device (not simulator)
4. Restart the device if badge doesn't update

**Android:**
1. Check device manufacturer's badge support
2. Enable notification permissions
3. Check launcher settings for badge support
4. Try a different launcher if device doesn't support badges

### Badge Count Not Updating

1. **Check console logs:**
   ```typescript
   console.log('Badge count set to:', count);
   ```

2. **Verify notification permissions:**
   - Go to device settings
   - Check app notification permissions
   - Ensure badges are enabled

3. **Test manually:**
   ```typescript
   import { Badge } from '@capawesome/capacitor-badge';
   await Badge.set({ count: 99 });
   ```

### Permission Issues

**If badge permission is denied:**
1. Go to device Settings → Apps → Your App
2. Enable notifications
3. Enable badges (if option available)
4. Restart the app

## Best Practices

### 1. Don't Overuse Badges
- Keep badge count meaningful
- Clear badges when notifications are read
- Don't use excessive numbers

### 2. Handle Edge Cases
```typescript
// Always check support before using
const { isSupported } = await Badge.isSupported();
if (!isSupported) {
  // Fall back to other notification methods
}
```

### 3. Respect User Preferences
- Allow users to disable badge notifications
- Clear badges when user marks all as read
- Don't set badges for muted conversations

### 4. Test Thoroughly
- Test on multiple devices
- Test with app in foreground/background/closed
- Test with low/high badge counts
- Test badge clearing

## Security Considerations

1. **Badge Count Privacy:**
   - Badge count is visible even when device is locked
   - Don't include sensitive information in badge numbers
   - Consider privacy when showing notification counts

2. **Permission Handling:**
   - Always check permissions before setting badge
   - Handle permission denial gracefully
   - Don't repeatedly request permissions if denied

## Performance Tips

1. **Batch Updates:**
   - Badge automatically updates with state changes
   - No need to manually call set() repeatedly
   - Hook handles all updates efficiently

2. **Background Updates:**
   - Badge can update even when app is closed
   - Updates happen via push notifications
   - No battery impact from badge updates

## Additional Resources

- [Capacitor Badge Plugin Documentation](https://github.com/capawesome-team/capacitor-plugins/tree/main/packages/badge)
- [iOS Badge Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons#App-icon-badges)
- [Android Badge Support](https://developer.android.com/develop/ui/views/notifications/badges)

## Summary

Badge notifications provide a seamless way to keep users informed of unread content:
- ✅ Automatic syncing with notification system
- ✅ Cross-platform support (iOS & Android)
- ✅ Configurable in Settings
- ✅ Real-time updates
- ✅ Works when app is closed
- ✅ Respects user preferences

Users can now stay updated even when not actively using the app!
