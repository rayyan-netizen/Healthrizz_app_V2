# HealthRizz Mobile

Expo/React Native app. iOS Simulator only (Android untested); no web target (no `react-native-web` installed, so `expo start --web` fails to bundle).

## Running the app

The dev client is normally already built and installed on the simulator as `org.healthrizz.app`, so day-to-day runs only need Metro:

```bash
# 1. Start Metro (dev-client mode, matches .claude/launch.json)
npx expo start --dev-client

# 2. Make sure a simulator is booted, then launch the installed app
xcrun simctl list devices booted        # confirm a device is booted
xcrun simctl launch booted org.healthrizz.app

# 3. If the app shows "No script URL provided" (Metro wasn't running yet),
#    reload once Metro is up: Cmd+R in the Simulator window, or Device > Reload.
```

Use the `expo` config in `.claude/launch.json` to run Metro as a background preview server instead of a raw `npx` command.

Only rebuild the native app (~10 min) when native deps/config changed, or the app isn't installed on the simulator yet:

```bash
npx expo run:ios --device 'iPhone 16 Pro'
```

`EXPO_PUBLIC_DEMO_MODE=true` in `.env` skips auth and renders against bundled fixtures — the Supabase dev backend has historically been down. See [MOBILE_STATUS.md](MOBILE_STATUS.md) for backend/build status details.
