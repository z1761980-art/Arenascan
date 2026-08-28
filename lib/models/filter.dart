enum FilterPreset {
  original,
  magicColor,
  blackWhite,
  grayscale,
}

extension FilterPresetX on FilterPreset {
  String get label => switch (this) {
        FilterPreset.original => 'Original',
        FilterPreset.magicColor => 'Magic Color',
        FilterPreset.blackWhite => 'B&W',
        FilterPreset.grayscale => 'Grayscale',
      };
}

class ManualAdjustments {
  const ManualAdjustments({
    this.brightness = 0,
    this.contrast = 0,
    this.saturation = 100,
  });

  final double brightness;
  final double contrast;
  final double saturation;

  static const identity = ManualAdjustments();

  bool get isIdentity => brightness == 0 && contrast == 0 && saturation == 100;

  ManualAdjustments copyWith({
    double? brightness,
    double? contrast,
    double? saturation,
  }) {
    return ManualAdjustments(
      brightness: brightness ?? this.brightness,
      contrast: contrast ?? this.contrast,
      saturation: saturation ?? this.saturation,
    );
  }
}
