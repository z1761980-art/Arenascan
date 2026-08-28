import 'package:cross_file/cross_file.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

Future<void> shareFile(BuildContext context, String path, {String? text}) async {
  await SharePlus.instance.share(
    ShareParams(
      files: [XFile(path)],
      text: text,
    ),
  );
}
