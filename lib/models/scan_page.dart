import 'filter.dart';

class ScanPage {
  ScanPage({
    required this.id,
    required this.imagePath,
    this.filter = FilterPreset.magicColor,
    this.adjustments = ManualAdjustments.identity,
    this.autoEnhanced = false,
  });

  final String id;
  final String imagePath;
  final FilterPreset filter;
  final ManualAdjustments adjustments;
  final bool autoEnhanced;

  String get fileName => imagePath.split(RegExp(r'[/\\]')).last;

  ScanPage copyWith({
    String? imagePath,
    FilterPreset? filter,
    ManualAdjustments? adjustments,
    bool? autoEnhanced,
  }) {
    return ScanPage(
      id: id,
      imagePath: imagePath ?? this.imagePath,
      filter: filter ?? this.filter,
      adjustments: adjustments ?? this.adjustments,
      autoEnhanced: autoEnhanced ?? this.autoEnhanced,
    );
  }
}
