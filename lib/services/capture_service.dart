import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';

import '../models/filter.dart';
import 'image_processing.dart';
import 'storage_service.dart';

class CaptureService {
  static final ImagePicker _picker = ImagePicker();

  static Future<String?> capturePage(BuildContext context) async {
    final file = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 95,
      preferredCameraDevice: CameraDevice.rear,
    );
    if (file == null) return null;
    return _cropAndNormalize(context, file.path);
  }

  static Future<String?> importPage(BuildContext context) async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 95,
    );
    if (file == null) return null;
    return _cropAndNormalize(context, file.path);
  }

  static Future<String?> _cropAndNormalize(BuildContext context, String sourcePath) async {
    final cropped = await ImageCropper().cropImage(
      sourcePath: sourcePath,
      compressFormat: ImageCompressFormat.jpg,
      compressQuality: 95,
      maxWidth: 2400,
      maxHeight: 2400,
      uiSettings: <PlatformUiSettings>[
        AndroidUiSettings(
          toolbarTitle: 'Adjust crop',
          toolbarWidgetColor: Colors.white,
          toolbarColor: const Color(0xFF2F6BFF),
          initAspectRatio: CropAspectRatioPreset.original,
          lockAspectRatio: false,
        ),
      ],
    );
    final path = cropped?.path ?? sourcePath;
    final bytes = await File(path).readAsBytes();
    final image = ImageProcessing.decode(bytes);
    if (image == null) return null;
    final fitted = ImageProcessing.fitToMax(image, 2400);
    final processed = ImageProcessing.pipeline(
      fitted,
      preset: FilterPreset.magicColor,
      adjustments: ManualAdjustments.identity,
      autoEnhanced: false,
    );
    final out = await StorageService.writeTempBytes(
      'page',
      ImageProcessing.encodeJpg(processed, quality: 95),
    );
    return out.path;
  }
}
