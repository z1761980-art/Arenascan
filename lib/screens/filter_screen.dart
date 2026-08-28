import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../models/filter.dart';
import '../models/scan_page.dart';
import '../services/image_processing.dart';
import '../services/ocr_service.dart';
import '../services/storage_service.dart';
import 'ocr_screen.dart';

class FilterScreen extends StatefulWidget {
  const FilterScreen({super.key, required this.pageId});

  final String pageId;

  @override
  State<FilterScreen> createState() => _FilterScreenState();
}

class _FilterScreenState extends State<FilterScreen> {
  ScanPage? _page;
  FilterPreset _preset = FilterPreset.magicColor;
  ManualAdjustments _adjustments = ManualAdjustments.identity;
  bool _autoEnhanced = false;
  ImageProvider? _previewImage;
  bool _busy = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final page = context.read<AppState>().sessionPages.firstWhere((e) => e.id == widget.pageId);
    _page = page;
    _preset = page.filter;
    _adjustments = page.adjustments;
    _autoEnhanced = page.autoEnhanced;
    await _rebuildPreview();
  }

  Future<void> _rebuildPreview() async {
    final page = _page;
    if (page == null) return;
    setState(() => _busy = true);
    final bytes = await File(page.imagePath).readAsBytes();
    final image = ImageProcessing.decode(bytes);
    if (image == null) {
      if (mounted) setState(() => _busy = false);
      return;
    }
    final preview = ImageProcessing.pipeline(
      ImageProcessing.fitToMax(image, 1200),
      preset: _preset,
      adjustments: _adjustments,
      autoEnhanced: _autoEnhanced,
    );
    final file = await StorageService.writeTempBytes('preview', ImageProcessing.encodeJpg(preview, quality: 88));
    if (!mounted) return;
    setState(() {
      _previewImage = FileImage(file);
      _busy = false;
    });
  }

  Future<void> _apply() async {
    final page = _page;
    if (page == null) return;
    setState(() => _busy = true);
    final bytes = await File(page.imagePath).readAsBytes();
    final image = ImageProcessing.decode(bytes);
    if (image == null) {
      if (mounted) setState(() => _busy = false);
      return;
    }
    final output = ImageProcessing.pipeline(
      ImageProcessing.fitToMax(image, 2400),
      preset: _preset,
      adjustments: _adjustments,
      autoEnhanced: _autoEnhanced,
    );
    final file = await StorageService.writeTempBytes('filtered', ImageProcessing.encodeJpg(output, quality: 95));
    final updated = page.copyWith(
      imagePath: file.path,
      filter: _preset,
      adjustments: _adjustments,
      autoEnhanced: _autoEnhanced,
    );
    context.read<AppState>().updatePage(updated);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _ocr() async {
    final page = _page;
    if (page == null) return;
    setState(() => _busy = true);
    try {
      final text = await OcrService.extractText(page.imagePath);
      if (!mounted) return;
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => OcrScreen(text: text, sourceName: page.fileName)));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Magic tools'),
        actions: [
          IconButton(onPressed: _busy ? null : _ocr, icon: const Icon(Icons.text_fields_outlined)),
          IconButton(onPressed: _busy ? null : _apply, icon: const Icon(Icons.check)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: scheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: _previewImage == null
                    ? const CircularProgressIndicator()
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image(image: _previewImage!, fit: BoxFit.contain),
                      ),
              ),
            ),
          ),
          SizedBox(
            height: 56,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              children: FilterPreset.values
                  .map(
                    (preset) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(preset.label),
                        selected: _preset == preset,
                        onSelected: (_) {
                          setState(() => _preset = preset);
                          _rebuildPreview();
                        },
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          SwitchListTile(
            title: const Text('Auto-enhance'),
            value: _autoEnhanced,
            onChanged: (value) {
              setState(() => _autoEnhanced = value);
              _rebuildPreview();
            },
          ),
          _SliderTile(
            label: 'Brightness',
            min: -100,
            max: 100,
            value: _adjustments.brightness,
            onChanged: (value) {
              setState(() => _adjustments = _adjustments.copyWith(brightness: value));
              _rebuildPreview();
            },
          ),
          _SliderTile(
            label: 'Contrast',
            min: -100,
            max: 100,
            value: _adjustments.contrast,
            onChanged: (value) {
              setState(() => _adjustments = _adjustments.copyWith(contrast: value));
              _rebuildPreview();
            },
          ),
          _SliderTile(
            label: 'Saturation',
            min: 0,
            max: 200,
            value: _adjustments.saturation,
            onChanged: (value) {
              setState(() => _adjustments = _adjustments.copyWith(saturation: value));
              _rebuildPreview();
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _SliderTile extends StatelessWidget {
  const _SliderTile({
    required this.label,
    required this.min,
    required this.max,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final double min;
  final double max;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label),
      subtitle: Slider(value: value, min: min, max: max, onChanged: onChanged),
      trailing: Text(value.round().toString()),
    );
  }
}
