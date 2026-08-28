import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../models/session_summary.dart';
import '../services/capture_service.dart';
import '../services/pdf_service.dart';
import '../services/storage_service.dart';
import '../widgets.dart';
import 'review_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _loading = true;
  List<SessionSummary> _sessions = const <SessionSummary>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final sessions = await StorageService.listSessions();
    if (!mounted) return;
    setState(() {
      _sessions = sessions;
      _loading = false;
    });
  }

  Future<void> _newScan() async {
    final appState = context.read<AppState>();
    appState.startFreshSession();
    final path = await CaptureService.capturePage(context);
    if (path == null) return;
    appState.addPage(path);
    if (!mounted) return;
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ReviewScreen()));
    _load();
  }

  Future<void> _importFromGallery() async {
    final appState = context.read<AppState>();
    appState.startFreshSession();
    final path = await CaptureService.importPage(context);
    if (path == null) return;
    appState.addPage(path);
    if (!mounted) return;
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ReviewScreen()));
    _load();
  }

  Future<void> _continueSession() async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ReviewScreen()));
    _load();
  }

  Future<void> _openSaved(SessionSummary session) async {
    final images = await StorageService.listSessionImagePaths(session.dirPath);
    if (!mounted || images.isEmpty) return;
    context.read<AppState>().openSavedSession(
          name: session.name,
          tag: session.tag,
          imagePaths: images,
        );
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ReviewScreen()));
    _load();
  }

  Future<void> _shareExistingPdf(SessionSummary session) async {
    final images = await StorageService.listSessionImagePaths(session.dirPath);
    if (images.isEmpty) return;
    final pdf = await PdfService.buildPdf(imagePaths: images, title: session.name);
    await StorageService.updateSessionPdfPath(session.dirPath, pdf.path);
    if (!mounted) return;
    await shareFile(context, pdf.path, text: session.name);
  }

  Future<void> _delete(SessionSummary session) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete scan?'),
        content: Text('Delete "${session.name}" and all its files?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok == true) {
      await StorageService.deleteSession(session.dirPath);
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    final scheme = Theme.of(context).colorScheme;
    final dateFmt = DateFormat('MMM d, HH:mm');
    return Scaffold(
      appBar: AppBar(
        title: const Text('ProScan AI'),
        actions: [
          IconButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
            icon: const Icon(Icons.settings_outlined),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2F6BFF), Color(0xFF6C4DF6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.camera_alt_outlined, size: 42, color: Colors.white),
                  const SizedBox(height: 16),
                  const Text(
                    'New scan',
                    style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Capture a page, crop it cleanly, enhance it, then export a shareable PDF.',
                    style: TextStyle(color: Colors.white.withOpacity(0.82), height: 1.5),
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.tonalIcon(
                        style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF2F6BFF)),
                        onPressed: _newScan,
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('Use camera'),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white54)),
                        onPressed: _importFromGallery,
                        icon: const Icon(Icons.photo_library_outlined),
                        label: const Text('Import'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (appState.pageCount > 0) ...[
              const SizedBox(height: 14),
              ListTile(
                tileColor: scheme.surfaceContainerLow,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                leading: const Icon(Icons.pending_actions_outlined),
                title: Text('${appState.pageCount} page${appState.pageCount == 1 ? '' : 's'} in current session'),
                subtitle: Text(appState.sessionName),
                trailing: const Icon(Icons.chevron_right),
                onTap: _continueSession,
              ),
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                Text('Recent scans', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600)),
                const Spacer(),
                if (!_loading) TextButton(onPressed: _load, child: const Text('Refresh')),
              ],
            ),
            const SizedBox(height: 8),
            if (_loading)
              for (var i = 0; i < 3; i++)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    height: 78,
                    decoration: BoxDecoration(
                      color: scheme.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                )
            else if (_sessions.isEmpty)
              Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  'No saved scans yet. Create your first one above.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: scheme.onSurfaceVariant),
                ),
              )
            else
              for (final session in _sessions)
                Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    leading: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: scheme.primaryContainer,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.description_outlined, color: scheme.onPrimaryContainer),
                    ),
                    title: Text(session.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      '${dateFmt.format(session.createdAt)} • ${session.pageCount} pages${session.tag.isEmpty ? '' : ' • ${session.tag}'}',
                    ),
                    onTap: () => _openSaved(session),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'share') {
                          _shareExistingPdf(session);
                        } else if (value == 'delete') {
                          _delete(session);
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'share', child: Text('Export PDF')),
                        PopupMenuItem(value: 'delete', child: Text('Delete')),
                      ],
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}
