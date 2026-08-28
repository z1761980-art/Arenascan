import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models/filter.dart';
import 'models/scan_page.dart';

class AppState extends ChangeNotifier {
  static const _onboardingKey = 'ps_onboarding_done_v1';
  static const _themeKey = 'ps_theme_mode_v1';

  bool onboardingDone = false;
  ThemeMode themeMode = ThemeMode.dark;
  String sessionName = _defaultSessionName();
  String sessionTag = '';
  final List<ScanPage> sessionPages = <ScanPage>[];

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    onboardingDone = prefs.getBool(_onboardingKey) ?? false;
    final savedTheme = prefs.getString(_themeKey);
    themeMode = switch (savedTheme) {
      'light' => ThemeMode.light,
      'system' => ThemeMode.system,
      _ => ThemeMode.dark,
    };
  }

  Future<void> completeOnboarding() async {
    onboardingDone = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardingKey, true);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.system => 'system',
      _ => 'dark',
    });
  }

  void startFreshSession() {
    sessionPages.clear();
    sessionName = _defaultSessionName();
    sessionTag = '';
    notifyListeners();
  }

  void openSavedSession({
    required String name,
    required String tag,
    required List<String> imagePaths,
  }) {
    sessionPages
      ..clear()
      ..addAll(
        imagePaths.asMap().entries.map(
          (entry) => ScanPage(
            id: 'saved_${DateTime.now().microsecondsSinceEpoch}_${entry.key}',
            imagePath: entry.value,
            filter: FilterPreset.original,
          ),
        ),
      );
    sessionName = name;
    sessionTag = tag;
    notifyListeners();
  }

  void addPage(String imagePath) {
    sessionPages.add(
      ScanPage(
        id: 'page_${DateTime.now().microsecondsSinceEpoch}',
        imagePath: imagePath,
        filter: FilterPreset.magicColor,
      ),
    );
    notifyListeners();
  }

  void updatePage(ScanPage page) {
    final index = sessionPages.indexWhere((item) => item.id == page.id);
    if (index == -1) return;
    sessionPages[index] = page;
    notifyListeners();
  }

  void removePage(String pageId) {
    sessionPages.removeWhere((page) => page.id == pageId);
    notifyListeners();
  }

  void movePage(int oldIndex, int newIndex) {
    if (newIndex > oldIndex) {
      newIndex -= 1;
    }
    final page = sessionPages.removeAt(oldIndex);
    sessionPages.insert(newIndex, page);
    notifyListeners();
  }

  void setSessionMeta({String? name, String? tag}) {
    if (name != null) sessionName = name;
    if (tag != null) sessionTag = tag;
    notifyListeners();
  }

  int get pageCount => sessionPages.length;
}

String _defaultSessionName() {
  final now = DateTime.now();
  String two(int value) => value.toString().padLeft(2, '0');
  return 'ProScan ${now.year}${two(now.month)}${two(now.day)}_${two(now.hour)}${two(now.minute)}';
}
