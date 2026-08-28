import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../models/scan_page.dart';
import '../services/capture_service.dart';
import '../services/ocr_service.dart';
import '../services/pdf_service.dart';
import '../services/storage_service.dart';
import '../widgets.dart';
import 'filter_screen.dart';
import 'ocr_screen.dart';

class ReviewScreen extends StatefulWidget {
  const ReviewScreen({super.key});

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _tagController;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final appState = context.read<AppState>();
    _nameController = TextEditingController(text: appState.sessionName);
    _tagController = TextEditingController(text: appState.sessionTag);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  Future<void> _addPageFromCamera() async {
    final path = await CaptureService.capturePage(context);
    if (path != null && mounted) {
      context.read<AppState>().addPage(path);
    }
  }

  Future<void> _addPageFromGallery() async {
    final path = await CaptureService.importPage(context);
    if (path != null && mounted) {
      context.read<AppState>().addPage(path);
    }
  }

  Future<void> _openFilter(ScanPage page) async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => FilterScreen(pageId: page.id)));
  }

  Future<void> _runOcr(ScanPage page) async {
    setState(() => _busy = true);
    try {
      final text = await OcrService.extractText(page.imagePath);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => OcrScreen(text: text, sourceName: page.fileName)),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _saveSession() async {
    final appState = context.read<AppState>();
    appState.setSessionMeta(name: _nameController.text.trim(), tag: _tagController.text.trim());
    setState(() => _busy = true);
    try {
      await StorageService.saveSession(
        name: appState.sessionName,
        tag: appState.sessionTag,
        imagePaths: appState.sessionPages.map((e) => e.imagePath).toList(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Session saved')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _exportPdf() async {
    final appState = context.read<AppState>();
    appState.setSessionMeta(name: _nameController.text.trim(), tag: _tagController.text.trim());
    setState(() => _busy = true);
    try {
      final pdf = await PdfService.buildPdf(
        imagePaths: appState.sessionPages.map((e) => e.imagePath).toList(),
        title: appState.sessionName,
      );
      if (!mounted) return;
      await shareFile(context, pdf.path, text: appState.sessionName);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _clearSession() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear current session?'),
        content: const Text('This removes the current working batch from memory. Saved scans stay on device.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Clear')),
        ],
      ),
    );
    if (ok == true && mounted) {
      context.read<AppState>().startFreshSession();
      _nameController.text = context.read<AppState>().sessionName;
      _tagController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    final pages = appState.sessionPages;
    return Scaffold(
      appBar: AppBar(
        title: Text('Review ${pages.length} page${pages.length == 1 ? '' : 's'}'),
      ),
      body: pages.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.collections_bookmark_outlined, size: 52),
                    const SizedBox(height: 14),
                    const Text('No pages in this session yet.'),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 10,
                      children: [
                        FilledButton.icon(
                          onPressed: _addPageFromCamera,
                          icon: const Icon(Icons.camera_alt_outlined),
                          label: const Text('Camera'),
                        ),
                        OutlinedButton.icon(
                          onPressed: _addPageFromGallery,
                          icon: const Icon(Icons.photo_library_outlined),
                          label: const Text('Gallery'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nameController,
                          decoration: const InputDecoration(labelText: 'Session name'),
                          onChanged: (value) => context.read<AppState>().setSessionMeta(name: value),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _tagController,
                          decoration: const InputDecoration(labelText: 'Tag'),
                          onChanged: (value) => context.read<AppState>().setSessionMeta(tag: value),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ReorderableListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                    itemCount: pages.length,
                    onReorder: context.read<AppState>().movePage,
                    itemBuilder: (context, index) {
                      final page = pages[index];
                      return Card(
                        key: ValueKey(page.id),
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.file(
                                  File(page.imagePath),
                                  width: 84,
                                  height: 112,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 84,
                                    height: 112,
                                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Page ${index + 1}', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text(page.filter.label),
                                    const SizedBox(height: 10),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: [
                                        OutlinedButton.icon(
                                          onPressed: _busy ? null : () => _openFilter(page),
                                          icon: const Icon(Icons.tune, size: 18),
                                          label: const Text('Magic tools'),
                                        ),
                                        OutlinedButton.icon(
                                          onPressed: _busy ? null : () => _runOcr(page),
                                          icon: const Icon(Icons.text_fields, size: 18),
                                          label: const Text('OCR'),
                                        ),
                                        OutlinedButton.icon(
                                          onPressed: _busy ? null : () => context.read<AppState>().removePage(page.id),
                                          icon: const Icon(Icons.delete_outline, size: 18),
                                          label: const Text('Delete'),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              ReorderableDragStartListener(
                                index: index,
                                child: const Padding(
                                  padding: EdgeInsets.all(8),
                                  child: Icon(Icons.drag_handle),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        FilledButton.icon(
                          onPressed: _busy ? null : _exportPdf,
                          icon: const Icon(Icons.picture_as_pdf_outlined),
                          label: const Text('Export PDF'),
                        ),
                        FilledButton.tonalIcon(
                          onPressed: _busy ? null : _saveSession,
                          icon: const Icon(Icons.save_outlined),
                          label: const Text('Save session'),
                        ),
                        OutlinedButton.icon(
                          onPressed: _busy ? null : _addPageFromCamera,
                          icon: const Icon(Icons.camera_alt_outlined),
                          label: const Text('Add page'),
                        ),
                        OutlinedButton.icon(
                          onPressed: _busy ? null : _addPageFromGallery,
                          icon: const Icon(Icons.photo_library_outlined),
                          label: const Text('Import'),
                        ),
                        TextButton.icon(
                          onPressed: _busy ? null : _clearSession,
                          icon: const Icon(Icons.refresh_outlined),
                          label: const Text('Clear'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
