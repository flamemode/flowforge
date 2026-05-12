import type { ProjectQuestionnaire } from "@/types";

export function getMobileSystemPrompt(): string {
  return `You are an expert mobile engineer generating complete, production-quality starter projects.

ABSOLUTE RULES — never break these:
1. FULL file paths always. For Expo: "app/index.tsx" not "index.tsx". "src/components/Button.tsx" not "Button.tsx".
   For Flutter: "lib/main.dart" not "main.dart". "lib/screens/home_screen.dart" not "home_screen.dart".
2. Every file is 100% complete — no "// TODO", no "// implement here", no truncation, no "..." shorthand.
3. For Expo/React Native: TypeScript (.ts / .tsx). Use Expo Router (file-based routing in app/ directory).
4. For Flutter: Dart (.dart). Use proper Flutter widget structure.
5. When returning JSON: return ONLY the raw JSON object. Zero markdown fences, zero explanation, nothing before or after the {.
6. Apply design_style and color_scheme to every UI file.
7. Implement every item listed in mobile_features[] in the relevant files.
8. React Native components use StyleSheet or NativeWind — never web-only CSS classes.`;
}

export function mobileSummary(q: ProjectQuestionnaire): string {
  return [
    `Project name: ${q.project_name}`,
    q.tagline ? `Tagline: "${q.tagline}"` : null,
    `Platform: mobile`,
    `App type: ${q.mobile_app_type ?? "general"}`,
    `Framework: ${q.mobile_framework ?? "expo"}`,
    `Backend: ${q.mobile_backend ?? "none"}`,
    q.auth && q.auth !== "none" ? `Auth: ${q.auth}` : null,
    q.payments && q.payments !== "none" ? `Payments: ${q.payments}` : null,
    q.mobile_features && q.mobile_features.length > 0 ? `Mobile features: ${q.mobile_features.join(", ")}` : null,
    q.design_style ? `Design style: ${q.design_style}` : null,
    q.color_scheme ? `Color scheme: ${q.color_scheme}` : null,
    q.animations ? `Animations: ${q.animations}` : null,
    q.industry ? `Industry: ${q.industry}` : null,
    q.content_tone ? `Content tone: ${q.content_tone}` : null,
    q.target_audience ? `Target audience: ${q.target_audience}` : null,
    `Description: ${q.description}`,
  ].filter(Boolean).join("\n");
}

function jsonInstruction(): string {
  return `Return a JSON object: { "full/path/file.ext": "complete file content", ... }
Return ONLY the JSON. No markdown, no explanation, no text outside the JSON.`;
}

const isFlutter = (q: ProjectQuestionnaire) => q.mobile_framework === "flutter";
const isSwift = (q: ProjectQuestionnaire) => q.mobile_framework === "swift";
const isKotlin = (q: ProjectQuestionnaire) => q.mobile_framework === "kotlin";

// ─── Step 1: package.json / pubspec.yaml ──────────────────────────────────────

export function getMobilePackagePrompt(q: ProjectQuestionnaire): string {
  const name = q.project_name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  if (isFlutter(q)) {
    return `Generate a complete, valid pubspec.yaml for this Flutter project.

${mobileSummary(q)}

Requirements:
- name: "${name}"
- Real, current version numbers for every dependency
- environment: sdk: ">=3.0.0 <4.0.0"
- flutter: sdk: flutter

Required dependencies based on stack:
${q.mobile_backend === "firebase" ? "- firebase_core: ^3.0.0\n- firebase_auth: ^5.0.0\n- cloud_firestore: ^5.0.0" : ""}
${q.mobile_backend === "supabase" ? "- supabase_flutter: ^2.0.0" : ""}
${q.mobile_backend === "rest_api" ? "- http: ^1.2.0\n- dio: ^5.4.0" : ""}
${q.mobile_features?.includes("maps") ? "- google_maps_flutter: ^2.6.0\n- geolocator: ^11.0.0" : ""}
${q.mobile_features?.includes("camera") ? "- image_picker: ^1.0.7\n- camera: ^0.10.5" : ""}
${q.mobile_features?.includes("push_notifications") ? "- firebase_messaging: ^15.0.0\n- flutter_local_notifications: ^17.0.0" : ""}
${q.mobile_features?.includes("biometric_auth") ? "- local_auth: ^2.1.8" : ""}
${q.mobile_features?.includes("in_app_purchases") ? "- in_app_purchase: ^3.1.13" : ""}
${q.mobile_features?.includes("analytics") ? "- firebase_analytics: ^11.0.0" : ""}
- shared_preferences: ^2.2.2
- provider: ^6.1.1
- go_router: ^13.0.0

Return ONLY the raw YAML content for pubspec.yaml. No markdown fences, no explanation.`;
  }

  if (isSwift(q)) {
    return `Generate a complete Package.swift for this Swift + SwiftUI project.

${mobileSummary(q)}

Requirements:
- Swift 5.9+
- iOS 17+ target
- Include relevant Swift Package Manager dependencies

Return ONLY the raw Swift content for Package.swift. No markdown fences, no explanation.`;
  }

  if (isKotlin(q)) {
    return `Generate a complete build.gradle.kts (app-level) for this Kotlin + Jetpack Compose project.

${mobileSummary(q)}

Requirements:
- compileSdk 34, minSdk 26, targetSdk 34
- Kotlin 1.9+, Compose compiler 1.5+
- Include relevant dependencies

Return ONLY the raw Kotlin build.gradle.kts content. No markdown fences, no explanation.`;
  }

  // Default: Expo
  return `Generate a complete, valid package.json for this Expo (React Native) project.

${mobileSummary(q)}

Requirements:
- "name": "${name}"
- Real, current version numbers for every dependency (no "latest", no "*")
- Use Expo SDK 51+
- scripts: { "start": "expo start", "android": "expo run:android", "ios": "expo run:ios", "build": "expo build", "type-check": "tsc --noEmit" }

Required dependencies:
- expo: ~51.0.0
- expo-router: ~3.5.0
- react: 18.2.0
- react-native: 0.74.0
- expo-status-bar: ~1.12.1
- expo-constants: ~16.0.2

${q.mobile_backend === "supabase" ? "- @supabase/supabase-js: ^2.46.0\n- expo-secure-store: ~13.0.2" : ""}
${q.mobile_backend === "firebase" ? "- firebase: ^10.0.0\n- @react-native-firebase/app: ^20.0.0\n- @react-native-firebase/auth: ^20.0.0" : ""}
${q.mobile_features?.includes("push_notifications") ? "- expo-notifications: ~0.28.0\n- expo-device: ~6.0.2" : ""}
${q.mobile_features?.includes("camera") ? "- expo-camera: ~15.0.0\n- expo-image-picker: ~15.0.7" : ""}
${q.mobile_features?.includes("maps") ? "- react-native-maps: 1.14.0\n- expo-location: ~17.0.1" : ""}
${q.mobile_features?.includes("biometric_auth") ? "- expo-local-authentication: ~14.0.1" : ""}
${q.mobile_features?.includes("in_app_purchases") ? "- expo-in-app-purchases: ~14.5.0" : ""}
${q.mobile_features?.includes("analytics") ? "- expo-analytics: ^1.0.0\n- @react-native-firebase/analytics: ^20.0.0" : ""}
${q.auth && q.auth !== "none" ? "- expo-auth-session: ~5.5.2\n- expo-web-browser: ~13.0.3" : ""}
${q.payments === "stripe" ? "- @stripe/stripe-react-native: 0.38.0" : ""}

devDependencies: typescript ~5.3.0, @types/react ~18.2.45, @babel/core ^7.24.0

Return ONLY the raw JSON content for package.json. No markdown fences, no explanation.`;
}

// ─── Step 2: Config files ─────────────────────────────────────────────────────

export function getMobileConfigPrompt(q: ProjectQuestionnaire): string {
  const name = q.project_name;
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  if (isFlutter(q)) {
    return `Generate Flutter config files for this project.

${mobileSummary(q)}

Return these files:
- analysis_options.yaml — Flutter analysis options with strict linting
- .gitignore — Flutter-specific gitignore

${jsonInstruction()}`;
  }

  if (isSwift(q)) {
    return `Generate an Xcode project config placeholder and .gitignore for this Swift + SwiftUI project.

${mobileSummary(q)}

Return these files:
- .gitignore — Xcode/Swift gitignore
- README_SETUP.md — Brief Xcode project setup instructions

${jsonInstruction()}`;
  }

  if (isKotlin(q)) {
    return `Generate Kotlin + Jetpack Compose config files for this project.

${mobileSummary(q)}

Return these files:
- settings.gradle.kts — Project settings
- build.gradle.kts — Root build file
- .gitignore — Android/Kotlin gitignore

${jsonInstruction()}`;
  }

  // Expo
  return `Generate config files for this Expo (React Native) project.

${mobileSummary(q)}

Return these files:
- app.json — Expo config with name "${name}", slug "${slug}", iOS/Android config
  ${q.mobile_features?.includes("push_notifications") ? '  Include "plugins": ["expo-notifications"] in app.json' : ""}
  ${q.mobile_features?.includes("camera") ? '  Include camera permission in app.json' : ""}
  ${q.mobile_features?.includes("maps") ? '  Include maps API key placeholder in app.json' : ""}
- tsconfig.json — Expo-compatible TypeScript config (extends expo/tsconfig.base)
- babel.config.js — Expo babel config
- .gitignore — React Native / Expo gitignore

${jsonInstruction()}`;
}

// ─── Step 3: .env.example ─────────────────────────────────────────────────────

export function getMobileEnvPrompt(q: ProjectQuestionnaire): string {
  return `Generate a .env.example file for this mobile project.

${mobileSummary(q)}

Include placeholders for:
${q.mobile_backend === "supabase" ? "- EXPO_PUBLIC_SUPABASE_URL=\n- EXPO_PUBLIC_SUPABASE_ANON_KEY=" : ""}
${q.mobile_backend === "firebase" ? "- FIREBASE_API_KEY=\n- FIREBASE_AUTH_DOMAIN=\n- FIREBASE_PROJECT_ID=\n- FIREBASE_STORAGE_BUCKET=\n- FIREBASE_MESSAGING_SENDER_ID=\n- FIREBASE_APP_ID=" : ""}
${q.mobile_backend === "rest_api" ? "- EXPO_PUBLIC_API_BASE_URL=" : ""}
${q.mobile_features?.includes("maps") ? "- EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=" : ""}
${q.payments === "stripe" ? "- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=" : ""}
${q.mobile_features?.includes("analytics") ? "- EXPO_PUBLIC_ANALYTICS_KEY=" : ""}

Return ONLY the raw .env.example content. No markdown fences, no explanation.`;
}

// ─── Step 4: Root navigation and layout ───────────────────────────────────────

export function getMobileRootFilesPrompt(q: ProjectQuestionnaire): string {
  if (isFlutter(q)) {
    return `Generate the root Flutter files for this project.

${mobileSummary(q)}

Return these files:
- lib/main.dart — App entry point with MaterialApp/GoRouter setup, theme based on design_style "${q.design_style ?? "minimalist"}" and color_scheme "${q.color_scheme ?? "light"}"
- lib/core/theme.dart — Theme configuration (light/dark based on color_scheme)
- lib/core/router.dart — GoRouter configuration with all screens

${jsonInstruction()}`;
  }

  if (isSwift(q)) {
    return `Generate root Swift + SwiftUI files for this project.

${mobileSummary(q)}

Return these files:
- Sources/App/${q.project_name}App.swift — App entry point (@main) with NavigationStack or TabView
- Sources/App/ContentView.swift — Root content view
- Sources/Core/Theme.swift — Color/font theme constants

${jsonInstruction()}`;
  }

  if (isKotlin(q)) {
    return `Generate root Kotlin + Jetpack Compose files for this project.

${mobileSummary(q)}

Return these files:
- app/src/main/java/com/${q.project_name.toLowerCase()}/MainActivity.kt — Main activity with Compose setup
- app/src/main/java/com/${q.project_name.toLowerCase()}/navigation/NavGraph.kt — Navigation graph
- app/src/main/java/com/${q.project_name.toLowerCase()}/ui/theme/Theme.kt — Material3 theme

${jsonInstruction()}`;
  }

  // Expo
  const hasAuth = q.auth && q.auth !== "none";
  return `Generate the root Expo Router files for this project.

${mobileSummary(q)}

Return these files:
- app/_layout.tsx — Root layout with ThemeProvider and font loading. Color scheme: "${q.color_scheme ?? "light"}"
- app/(tabs)/_layout.tsx — Bottom tab navigator with appropriate tabs for a "${q.mobile_app_type ?? "general"}" app
- app/index.tsx — Redirect to /(tabs) or /login depending on auth state
${hasAuth ? "- app/login.tsx — Login screen with email/password and social auth options" : ""}
${hasAuth ? "- app/register.tsx — Sign up screen" : ""}
- src/constants/Colors.ts — Color constants for light and dark themes

${jsonInstruction()}`;
}

// ─── Step 5: Main screens ─────────────────────────────────────────────────────

export function getMobileScreensPrompt(q: ProjectQuestionnaire): string {
  const appType = q.mobile_app_type ?? "general";

  if (isFlutter(q)) {
    return `Generate Flutter screen files for this ${appType} app.

${mobileSummary(q)}

Return the main screens in lib/screens/:
- lib/screens/home_screen.dart — Main home/feed screen
- lib/screens/profile_screen.dart — User profile screen
${appType === "ecommerce" ? "- lib/screens/product_list_screen.dart — Product browsing\n- lib/screens/cart_screen.dart — Shopping cart" : ""}
${appType === "social" ? "- lib/screens/feed_screen.dart — Social feed\n- lib/screens/explore_screen.dart — Explore/discover" : ""}
${appType === "fitness" ? "- lib/screens/workout_screen.dart — Workout tracking\n- lib/screens/progress_screen.dart — Progress charts" : ""}
${appType === "food_delivery" ? "- lib/screens/restaurant_list_screen.dart — Restaurant browsing\n- lib/screens/order_screen.dart — Order tracking" : ""}
${appType === "finance" ? "- lib/screens/dashboard_screen.dart — Financial overview\n- lib/screens/transactions_screen.dart — Transaction list" : ""}

Each screen should be fully implemented with real UI, not placeholders.

${jsonInstruction()}`;
  }

  if (isSwift(q)) {
    return `Generate Swift + SwiftUI screen files for this ${appType} app.

${mobileSummary(q)}

Return the main views in Sources/Screens/:
- Sources/Screens/HomeView.swift — Main home screen
- Sources/Screens/ProfileView.swift — User profile
${appType === "ecommerce" ? "- Sources/Screens/ProductListView.swift — Product grid\n- Sources/Screens/CartView.swift — Shopping cart" : ""}
${appType === "social" ? "- Sources/Screens/FeedView.swift — Social feed\n- Sources/Screens/ExploreView.swift — Explore" : ""}
${appType === "fitness" ? "- Sources/Screens/WorkoutView.swift — Workout tracking\n- Sources/Screens/ProgressView.swift — Progress" : ""}

Each view should be fully implemented with real SwiftUI code.

${jsonInstruction()}`;
  }

  if (isKotlin(q)) {
    return `Generate Kotlin + Jetpack Compose screen files for this ${appType} app.

${mobileSummary(q)}

Return the main screens:
- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/HomeScreen.kt — Main home screen
- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/ProfileScreen.kt — User profile
${appType === "ecommerce" ? `- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/ProductListScreen.kt — Product grid\n- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/CartScreen.kt — Cart` : ""}
${appType === "social" ? `- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/FeedScreen.kt — Social feed\n- app/src/main/java/com/${q.project_name.toLowerCase()}/screens/ExploreScreen.kt — Explore` : ""}

Each screen should be fully implemented with real Compose code.

${jsonInstruction()}`;
  }

  // Expo
  return `Generate main screen files for this Expo ${appType} app.

${mobileSummary(q)}

Return these tab screens in app/(tabs)/:
- app/(tabs)/index.tsx — Home/main screen appropriate for a "${appType}" app
- app/(tabs)/profile.tsx — User profile screen
${appType === "ecommerce" ? "- app/(tabs)/shop.tsx — Product browsing screen\n- app/(tabs)/cart.tsx — Shopping cart screen" : ""}
${appType === "social" ? "- app/(tabs)/feed.tsx — Social feed\n- app/(tabs)/explore.tsx — Explore/discover screen" : ""}
${appType === "fitness" ? "- app/(tabs)/workout.tsx — Workout tracking\n- app/(tabs)/progress.tsx — Progress/stats screen" : ""}
${appType === "food_delivery" ? "- app/(tabs)/restaurants.tsx — Restaurant list\n- app/(tabs)/orders.tsx — Order tracking" : ""}
${appType === "finance" ? "- app/(tabs)/dashboard.tsx — Financial overview\n- app/(tabs)/transactions.tsx — Transaction list" : ""}
${appType === "productivity" ? "- app/(tabs)/tasks.tsx — Task list\n- app/(tabs)/calendar.tsx — Calendar view" : ""}
${appType === "education" ? "- app/(tabs)/courses.tsx — Course list\n- app/(tabs)/learn.tsx — Learning screen" : ""}
${appType === "news" ? "- app/(tabs)/news.tsx — News feed\n- app/(tabs)/saved.tsx — Saved articles" : ""}
${appType === "travel" ? "- app/(tabs)/explore.tsx — Travel exploration\n- app/(tabs)/bookings.tsx — Bookings" : ""}
${appType === "game" ? "- app/(tabs)/game.tsx — Main game screen\n- app/(tabs)/leaderboard.tsx — Leaderboard" : ""}

Use React Native components (View, Text, ScrollView, FlatList, TouchableOpacity, etc.) with StyleSheet.
Design style: "${q.design_style ?? "minimalist"}", color scheme: "${q.color_scheme ?? "light"}"
Each screen should be fully implemented with real UI.

${jsonInstruction()}`;
}

// ─── Step 6: UI components ────────────────────────────────────────────────────

export function getMobileComponentsPrompt(q: ProjectQuestionnaire): string {
  if (isFlutter(q)) {
    return `Generate reusable Flutter widget files for this project.

${mobileSummary(q)}

Return widgets in lib/widgets/:
- lib/widgets/app_button.dart — Styled button widget
- lib/widgets/app_card.dart — Card widget
- lib/widgets/loading_indicator.dart — Loading spinner
- lib/widgets/empty_state.dart — Empty state widget
${q.mobile_features?.includes("camera") ? "- lib/widgets/image_picker_widget.dart — Image picker" : ""}

${jsonInstruction()}`;
  }

  if (isSwift(q)) {
    return `Generate reusable Swift + SwiftUI component files for this project.

${mobileSummary(q)}

Return components in Sources/Components/:
- Sources/Components/AppButton.swift — Styled button
- Sources/Components/AppCard.swift — Card view
- Sources/Components/LoadingView.swift — Loading indicator
- Sources/Components/EmptyStateView.swift — Empty state

${jsonInstruction()}`;
  }

  if (isKotlin(q)) {
    return `Generate reusable Kotlin + Jetpack Compose component files for this project.

${mobileSummary(q)}

Return components:
- app/src/main/java/com/${q.project_name.toLowerCase()}/ui/components/AppButton.kt — Styled button
- app/src/main/java/com/${q.project_name.toLowerCase()}/ui/components/AppCard.kt — Card composable
- app/src/main/java/com/${q.project_name.toLowerCase()}/ui/components/LoadingIndicator.kt — Loading

${jsonInstruction()}`;
  }

  // Expo
  return `Generate reusable React Native component files for this Expo project.

${mobileSummary(q)}

Return components in src/components/:
- src/components/Button.tsx — Styled touchable button with variants (primary, secondary, outline)
- src/components/Card.tsx — Card container component
- src/components/Header.tsx — Screen header component
- src/components/LoadingSpinner.tsx — Loading indicator
- src/components/EmptyState.tsx — Empty state with icon and message
${q.mobile_features?.includes("camera") ? "- src/components/ImagePicker.tsx — Camera/gallery picker using expo-image-picker" : ""}
${q.mobile_features?.includes("maps") ? "- src/components/MapView.tsx — Map component wrapper using react-native-maps" : ""}
${q.mobile_features?.includes("biometric_auth") ? "- src/components/BiometricPrompt.tsx — Biometric auth trigger component" : ""}

Design style: "${q.design_style ?? "minimalist"}", color scheme: "${q.color_scheme ?? "light"}"
Use StyleSheet API. No web CSS.

${jsonInstruction()}`;
}

// ─── Step 7: Services/API layer ───────────────────────────────────────────────

export function getMobileServicesPrompt(q: ProjectQuestionnaire): string {
  if (isFlutter(q)) {
    return `Generate Flutter service and data layer files for this project.

${mobileSummary(q)}

Return service files in lib/services/ and lib/models/:
- lib/services/auth_service.dart — Authentication service
${q.mobile_backend === "supabase" ? "- lib/services/supabase_service.dart — Supabase client and queries" : ""}
${q.mobile_backend === "firebase" ? "- lib/services/firebase_service.dart — Firebase client and queries" : ""}
${q.mobile_backend === "rest_api" ? "- lib/services/api_service.dart — REST API client using Dio" : ""}
- lib/models/user.dart — User model with fromJson/toJson
- lib/providers/app_provider.dart — Main ChangeNotifier provider

${jsonInstruction()}`;
  }

  if (isSwift(q)) {
    return `Generate Swift service files for this project.

${mobileSummary(q)}

Return service files in Sources/Services/:
- Sources/Services/AuthService.swift — Authentication
${q.mobile_backend === "supabase" ? "- Sources/Services/SupabaseService.swift — Supabase client" : ""}
${q.mobile_backend === "firebase" ? "- Sources/Services/FirebaseService.swift — Firebase client" : ""}
${q.mobile_backend === "rest_api" ? "- Sources/Services/APIService.swift — URLSession-based API client" : ""}
- Sources/Models/User.swift — User model (Codable)
- Sources/ViewModels/AppViewModel.swift — Main ObservableObject

${jsonInstruction()}`;
  }

  if (isKotlin(q)) {
    return `Generate Kotlin service files for this project.

${mobileSummary(q)}

Return service files:
- app/src/main/java/com/${q.project_name.toLowerCase()}/data/AuthRepository.kt — Auth repository
${q.mobile_backend === "supabase" ? `- app/src/main/java/com/${q.project_name.toLowerCase()}/data/SupabaseClient.kt — Supabase client` : ""}
${q.mobile_backend === "firebase" ? `- app/src/main/java/com/${q.project_name.toLowerCase()}/data/FirebaseService.kt — Firebase service` : ""}
${q.mobile_backend === "rest_api" ? `- app/src/main/java/com/${q.project_name.toLowerCase()}/data/ApiService.kt — Retrofit API service` : ""}
- app/src/main/java/com/${q.project_name.toLowerCase()}/data/models/User.kt — User data class
- app/src/main/java/com/${q.project_name.toLowerCase()}/viewmodels/MainViewModel.kt — Main ViewModel

${jsonInstruction()}`;
  }

  // Expo
  const hasAuth = q.auth && q.auth !== "none";
  return `Generate service and hooks files for this Expo project.

${mobileSummary(q)}

Return these files:

${q.mobile_backend === "supabase" ? `- src/services/supabase.ts — Supabase client initialization using expo-secure-store
- src/services/database.ts — Database query functions` : ""}
${q.mobile_backend === "firebase" ? `- src/services/firebase.ts — Firebase app initialization
- src/services/firestore.ts — Firestore query functions` : ""}
${q.mobile_backend === "rest_api" ? "- src/services/api.ts — REST API client with fetch/axios, base URL from env" : ""}
${hasAuth ? "- src/services/auth.ts — Auth functions (signIn, signUp, signOut, getUser)" : ""}
${q.mobile_features?.includes("push_notifications") ? "- src/services/notifications.ts — Push notification registration and handling" : ""}
- src/hooks/useAuth.ts — useAuth hook returning user and auth functions
- src/hooks/useTheme.ts — useTheme hook for accessing current theme colors
- src/types/index.ts — Shared TypeScript types for this app

${jsonInstruction()}`;
}

// ─── Step 8: README ───────────────────────────────────────────────────────────

export function getMobileReadmePrompt(q: ProjectQuestionnaire): string {
  return `Generate a README.md for this mobile project.

${mobileSummary(q)}

Include sections:
- Project name and brief description
- Tech stack (framework, backend, key features)
- Prerequisites and setup instructions
- How to run on iOS and Android
- Environment variables needed
- Project structure overview
- Key features list
- How to build for production / submit to app stores

Return ONLY the raw markdown content. No markdown fences wrapping the whole document, no explanation.`;
}
