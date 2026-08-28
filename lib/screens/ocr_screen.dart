import 'dart:convert';

import 'package:cross_file/cross_file.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

class OcrScreen extends StatelessWidget {
  const OcrScreen({super.key, required this.text, required this.sourceName});

  final String text;
  final String sourceName;

  Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Text copied')));
  }

  Future<void> _shareText() async {
    await SharePlus.instance.share(ShareParams(text: text, subject: sourceName));
  }

  Future<void> _saveTxt() async {
    final file = XFile.fromData(utf8.encode(text), mimeType: 'text/plain');
    await SharePlus.instance.share(
      ShareParams(
        files: [file],
        subject: sourceName,
        fileNameOverrides: ['$sourceName.txt'],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Extracted text'),
        actions: [
          IconButton(onPressed: () => _copy(context), icon: const Icon(Icons.copy_all_outlined)),
          IconButton(onPressed: _shareText, icon: const Icon(Icons.share_outlined)),
          IconButton(onPressed: _saveTxt, icon: const Icon(Icons.download_outlined)),
        ],
      ),
      body: text.trim().isEmpty
          ? const Center(child: Padding(padding: EdgeInsets.all(24), child: Text('No text was found on this page.')))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: SelectableText(text, style: const TextStyle(fontSize: 15, height: 1.6)),
            ),
    );
  }
}
