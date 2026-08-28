import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const SizedBox(height: 12),
          ListTile(
            title: const Text('Theme mode'),
            subtitle: const Text('Choose how ProScan AI looks'),
          ),
          RadioListTile<ThemeMode>(
            value: ThemeMode.system,
            groupValue: appState.themeMode,
            onChanged: (mode) => appState.setThemeMode(mode ?? ThemeMode.system),
            title: const Text('System'),
          ),
          RadioListTile<ThemeMode>(
            value: ThemeMode.light,
            groupValue: appState.themeMode,
            onChanged: (mode) => appState.setThemeMode(mode ?? ThemeMode.light),
            title: const Text('Light'),
          ),
          RadioListTile<ThemeMode>(
            value: ThemeMode.dark,
            groupValue: appState.themeMode,
            onChanged: (mode) => appState.setThemeMode(mode ?? ThemeMode.dark),
            title: const Text('Dark'),
          ),
          const Divider(),
          const AboutListTile(
            applicationName: 'ProScan AI',
            applicationVersion: '1.0.0',
            applicationLegalese: 'Arena.ai rebuild',
          ),
        ],
      ),
    );
  }
}
