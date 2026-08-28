import 'dart:math' as math;
import 'dart:typed_data';

import 'package:image/image.dart' as img;

import '../models/filter.dart';

class ImageProcessing {
  static img.Image? decode(Uint8List bytes) => img.decodeImage(bytes);

  static Uint8List encodeJpg(img.Image image, {int quality = 95}) {
    return Uint8List.fromList(img.encodeJpg(image, quality: quality));
  }

  static img.Image fitToMax(img.Image input, int maxDim) {
    final longest = math.max(input.width, input.height);
    if (longest <= maxDim) {
      return input.clone();
    }
    final scale = maxDim / longest;
    final width = math.max(1, (input.width * scale).round());
    final height = math.max(1, (input.height * scale).round());
    return img.copyResize(
      input,
      width: width,
      height: height,
      interpolation: img.Interpolation.average,
    );
  }

  static img.Image pipeline(
    img.Image base, {
    required FilterPreset preset,
    required ManualAdjustments adjustments,
    required bool autoEnhanced,
  }) {
    var working = switch (preset) {
      FilterPreset.original => base.clone(),
      FilterPreset.magicColor => _magicColor(base),
      FilterPreset.blackWhite => _blackAndWhite(base),
      FilterPreset.grayscale => _grayscale(base),
    };
    if (autoEnhanced) {
      working = _autoEnhance(working);
    }
    if (!adjustments.isIdentity) {
      working = _adjust(working, adjustments);
    }
    return working;
  }

  static img.Image _grayscale(img.Image source) {
    final image = source.clone();
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final px = image.getPixel(x, y);
        final l = (0.299 * px.r + 0.587 * px.g + 0.114 * px.b).round();
        image.setPixelRgba(x, y, l, l, l, px.a.toInt());
      }
    }
    return image;
  }

  static img.Image _blackAndWhite(img.Image source) {
    final gray = _grayscale(source);
    final hist = List<int>.filled(256, 0);
    for (var y = 0; y < gray.height; y++) {
      for (var x = 0; x < gray.width; x++) {
        hist[gray.getPixel(x, y).r.toInt()]++;
      }
    }
    final threshold = _otsu(hist, gray.width * gray.height);
    for (var y = 0; y < gray.height; y++) {
      for (var x = 0; x < gray.width; x++) {
        final px = gray.getPixel(x, y);
        final v = px.r >= threshold ? 255 : 0;
        gray.setPixelRgba(x, y, v, v, v, px.a.toInt());
      }
    }
    return gray;
  }

  static int _otsu(List<int> hist, int total) {
    double sum = 0;
    for (var i = 0; i < 256; i++) {
      sum += i * hist[i];
    }
    double sumB = 0;
    int wB = 0;
    int wF = 0;
    double maxVariance = 0;
    int threshold = 140;
    for (var i = 0; i < 256; i++) {
      wB += hist[i];
      if (wB == 0) continue;
      wF = total - wB;
      if (wF == 0) break;
      sumB += i * hist[i];
      final mB = sumB / wB;
      final mF = (sum - sumB) / wF;
      final variance = wB * wF * math.pow(mB - mF, 2);
      if (variance > maxVariance) {
        maxVariance = variance.toDouble();
        threshold = i;
      }
    }
    return threshold;
  }

  static img.Image _magicColor(img.Image source) {
    final image = source.clone();
    double sumR = 0;
    double sumG = 0;
    double sumB = 0;
    var count = 0;
    var minLum = 255.0;
    var maxLum = 0.0;
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final px = image.getPixel(x, y);
        sumR += px.r;
        sumG += px.g;
        sumB += px.b;
        final lum = 0.299 * px.r + 0.587 * px.g + 0.114 * px.b;
        minLum = math.min(minLum, lum);
        maxLum = math.max(maxLum, lum);
        count++;
      }
    }
    final avgR = sumR / count;
    final avgG = sumG / count;
    final avgB = sumB / count;
    final gray = (avgR + avgG + avgB) / 3;
    final rScale = gray / math.max(1, avgR);
    final gScale = gray / math.max(1, avgG);
    final bScale = gray / math.max(1, avgB);
    final range = math.max(1.0, maxLum - minLum);

    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final px = image.getPixel(x, y);
        final nr = _clamp((((px.r * rScale) - minLum) * 255 / range) + 8);
        final ng = _clamp((((px.g * gScale) - minLum) * 255 / range) + 8);
        final nb = _clamp((((px.b * bScale) - minLum) * 255 / range) + 8);
        final adjusted = _withSaturation(nr, ng, nb, 112);
        image.setPixelRgba(
          x,
          y,
          adjusted.$1,
          adjusted.$2,
          adjusted.$3,
          px.a.toInt(),
        );
      }
    }
    return image;
  }

  static img.Image _autoEnhance(img.Image source) {
    final image = source.clone();
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final px = image.getPixel(x, y);
        final contrasted = _applyContrast(px.r.toDouble(), 18);
        final contrastedG = _applyContrast(px.g.toDouble(), 18);
        final contrastedB = _applyContrast(px.b.toDouble(), 18);
        final adjusted = _withSaturation(
          _clamp(contrasted + 6),
          _clamp(contrastedG + 6),
          _clamp(contrastedB + 6),
          116,
        );
        image.setPixelRgba(
          x,
          y,
          adjusted.$1,
          adjusted.$2,
          adjusted.$3,
          px.a.toInt(),
        );
      }
    }
    return image;
  }

  static img.Image _adjust(img.Image source, ManualAdjustments adjustments) {
    final image = source.clone();
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        final px = image.getPixel(x, y);
        final r = _applyContrast(px.r.toDouble() + adjustments.brightness, adjustments.contrast);
        final g = _applyContrast(px.g.toDouble() + adjustments.brightness, adjustments.contrast);
        final b = _applyContrast(px.b.toDouble() + adjustments.brightness, adjustments.contrast);
        final saturated = _withSaturation(_clamp(r), _clamp(g), _clamp(b), adjustments.saturation.round());
        image.setPixelRgba(
          x,
          y,
          saturated.$1,
          saturated.$2,
          saturated.$3,
          px.a.toInt(),
        );
      }
    }
    return image;
  }

  static (int, int, int) _withSaturation(int r, int g, int b, int amount) {
    final scale = amount / 100.0;
    final gray = (0.299 * r + 0.587 * g + 0.114 * b);
    final nr = _clamp(gray + (r - gray) * scale);
    final ng = _clamp(gray + (g - gray) * scale);
    final nb = _clamp(gray + (b - gray) * scale);
    return (nr, ng, nb);
  }

  static int _clamp(num value) => value.round().clamp(0, 255) as int;

  static double _applyContrast(double value, double contrast) {
    if (contrast == 0) return value;
    final factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    return factor * (value - 128) + 128;
  }
}
