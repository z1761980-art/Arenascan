import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class PdfService {
  static Future<File> buildPdf({
    required List<String> imagePaths,
    required String title,
  }) async {
    final doc = pw.Document(title: title);
    for (final path in imagePaths) {
      final bytes = await File(path).readAsBytes();
      final image = pw.MemoryImage(bytes);
      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(24),
          build: (_) => pw.Center(
            child: pw.FittedBox(
              fit: pw.BoxFit.contain,
              child: pw.Image(image),
            ),
          ),
        ),
      );
    }
    final temp = await getTemporaryDirectory();
    final file = File(
      p.join(temp.path, 'proscan_${DateTime.now().millisecondsSinceEpoch}.pdf'),
    );
    await file.writeAsBytes(await doc.save(), flush: true);
    return file;
  }
}
