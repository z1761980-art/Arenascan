import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../models/session_summary.dart';

class StorageService {
  static Future<Directory> _baseDir() async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(docs.path, 'proscan_ai'));
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  static Future<File> writeTempBytes(
    String prefix,
    Uint8List bytes, {
    String extension = '.jpg',
  }) async {
    final temp = await getTemporaryDirectory();
    final file = File(
      p.join(
        temp.path,
        '${prefix}_${DateTime.now().microsecondsSinceEpoch}$extension',
      ),
    );
    await file.parent.create(recursive: true);
    await file.writeAsBytes(bytes, flush: true);
    return file;
  }

  static Future<File> saveSession({
    required String name,
    required String tag,
    required List<String> imagePaths,
  }) async {
    final base = await _baseDir();
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final dir = Directory(p.join(base.path, 'sessions', id));
    await dir.create(recursive: true);

    final savedNames = <String>[];
    for (var i = 0; i < imagePaths.length; i++) {
      final source = File(imagePaths[i]);
      final fileName = 'page_${(i + 1).toString().padLeft(2, '0')}.jpg';
      final dest = File(p.join(dir.path, fileName));
      await dest.writeAsBytes(await source.readAsBytes(), flush: true);
      savedNames.add(fileName);
    }

    final pdfPath = p.join(dir.path, 'scan.pdf');
    final meta = File(p.join(dir.path, 'metadata.json'));
    await meta.writeAsString(
      const JsonEncoder.withIndent('  ').convert({
        'id': id,
        'name': name,
        'tag': tag,
        'createdAt': DateTime.now().toIso8601String(),
        'pageCount': imagePaths.length,
        'pages': savedNames,
        'pdfPath': pdfPath,
      }),
      flush: true,
    );
    return meta;
  }

  static Future<List<SessionSummary>> listSessions() async {
    final base = await _baseDir();
    final sessionsDir = Directory(p.join(base.path, 'sessions'));
    if (!await sessionsDir.exists()) return const <SessionSummary>[];
    final out = <SessionSummary>[];
    await for (final entity in sessionsDir.list()) {
      if (entity is! Directory) continue;
      final metaFile = File(p.join(entity.path, 'metadata.json'));
      if (!await metaFile.exists()) continue;
      try {
        final map = jsonDecode(await metaFile.readAsString()) as Map<String, dynamic>;
        out.add(
          SessionSummary(
            id: '${map['id'] ?? p.basename(entity.path)}',
            name: '${map['name'] ?? 'Untitled scan'}',
            tag: '${map['tag'] ?? ''}',
            dirPath: entity.path,
            createdAt: DateTime.tryParse('${map['createdAt']}') ?? DateTime.now(),
            pageCount: (map['pageCount'] as num?)?.toInt() ?? ((map['pages'] as List?)?.length ?? 0),
          ),
        );
      } catch (_) {}
    }
    out.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return out;
  }

  static Future<List<String>> listSessionImagePaths(String dirPath) async {
    final meta = File(p.join(dirPath, 'metadata.json'));
    if (!await meta.exists()) return const <String>[];
    final decoded = jsonDecode(await meta.readAsString()) as Map<String, dynamic>;
    final pages = (decoded['pages'] as List<dynamic>? ?? const <dynamic>[])
        .map((e) => File(p.join(dirPath, '$e')).path)
        .toList();
    return pages;
  }

  static Future<String?> sessionPdfPath(String dirPath) async {
    final meta = File(p.join(dirPath, 'metadata.json'));
    if (!await meta.exists()) return null;
    final decoded = jsonDecode(await meta.readAsString()) as Map<String, dynamic>;
    return decoded['pdfPath'] as String?;
  }

  static Future<void> updateSessionPdfPath(String dirPath, String pdfPath) async {
    final meta = File(p.join(dirPath, 'metadata.json'));
    if (!await meta.exists()) return;
    final decoded = jsonDecode(await meta.readAsString()) as Map<String, dynamic>;
    decoded['pdfPath'] = pdfPath;
    await meta.writeAsString(const JsonEncoder.withIndent('  ').convert(decoded), flush: true);
  }

  static Future<void> deleteSession(String dirPath) async {
    final dir = Directory(dirPath);
    if (await dir.exists()) {
      await dir.delete(recursive: true);
    }
  }
}
