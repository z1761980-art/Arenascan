package com.proscan.ai;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.PointF;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

public class EditorActivity extends Activity {
    public static final String EXTRA_INPUT = "input";
    public static final String EXTRA_INDEX = "index";

    private String inputPath;
    private int pageIndex;
    private Bitmap original;
    private Bitmap preview;
    private CropImageView cropView;
    private int preset = ImageUtils.FILTER_MAGIC;
    private boolean autoEnhance = false;
    private float brightness = 0;
    private float contrast = 0;
    private float saturation = 100;
    private TextView brightnessLabel;
    private TextView contrastLabel;
    private TextView saturationLabel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        inputPath = getIntent().getStringExtra(EXTRA_INPUT);
        pageIndex = getIntent().getIntExtra(EXTRA_INDEX, -1);
        original = ImageUtils.decodeScaled(inputPath, 2200);
        if (original == null) {
            Toast.makeText(this, "Could not open image", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#0B0F1A"));

        TextView title = new TextView(this);
        title.setText("Adjust crop and filter");
        title.setTextSize(20f);
        title.setTextColor(Color.WHITE);
        title.setPadding(24, 32, 24, 18);
        root.addView(title);

        cropView = new CropImageView(this);
        LinearLayout.LayoutParams cropParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f);
        cropParams.setMargins(16, 0, 16, 0);
        root.addView(cropView, cropParams);

        HorizontalScrollView hsv = new HorizontalScrollView(this);
        LinearLayout filterRow = new LinearLayout(this);
        filterRow.setOrientation(LinearLayout.HORIZONTAL);
        filterRow.setPadding(16, 16, 16, 8);
        hsv.addView(filterRow);
        filterRow.addView(filterButton("Original", ImageUtils.FILTER_ORIGINAL));
        filterRow.addView(filterButton("Magic", ImageUtils.FILTER_MAGIC));
        filterRow.addView(filterButton("B&W", ImageUtils.FILTER_BW));
        filterRow.addView(filterButton("Gray", ImageUtils.FILTER_GRAY));
        filterRow.addView(actionButton("Rotate", new View.OnClickListener() {
            @Override public void onClick(View v) {
                original = ImageUtils.rotate(original, 1);
                rebuildPreview();
            }
        }));
        filterRow.addView(actionButton("Auto", new View.OnClickListener() {
            @Override public void onClick(View v) {
                autoEnhance = !autoEnhance;
                rebuildPreview();
            }
        }));
        root.addView(hsv);

        brightnessLabel = slider(root, "Brightness", -100, 100, 100, 0, new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int value, boolean fromUser) {
                brightness = value - 100;
                brightnessLabel.setText("Brightness: " + Math.round(brightness));
                rebuildPreview();
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        contrastLabel = slider(root, "Contrast", -100, 100, 100, 0, new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int value, boolean fromUser) {
                contrast = value - 100;
                contrastLabel.setText("Contrast: " + Math.round(contrast));
                rebuildPreview();
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });
        saturationLabel = slider(root, "Saturation", 0, 200, 100, 100, new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar seekBar, int value, boolean fromUser) {
                saturation = value;
                saturationLabel.setText("Saturation: " + Math.round(saturation));
                rebuildPreview();
            }
            @Override public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        LinearLayout bottom = new LinearLayout(this);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setGravity(Gravity.END);
        bottom.setPadding(16, 8, 16, 24);
        Button cancel = new Button(this);
        cancel.setText("Cancel");
        cancel.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });
        Button apply = new Button(this);
        apply.setText("Apply");
        apply.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { applyAndReturn(); }
        });
        bottom.addView(cancel);
        bottom.addView(apply);
        root.addView(bottom);

        setContentView(root);
        rebuildPreview();
    }

    private View filterButton(String label, final int filterValue) {
        return actionButton(label, new View.OnClickListener() {
            @Override public void onClick(View v) {
                preset = filterValue;
                rebuildPreview();
            }
        });
    }

    private Button actionButton(String label, View.OnClickListener listener) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(8, 0, 8, 0);
        button.setLayoutParams(lp);
        return button;
    }

    private TextView slider(LinearLayout root, String label, int min, int max, int initial, int neutral, SeekBar.OnSeekBarChangeListener listener) {
        TextView tv = new TextView(this);
        tv.setTextColor(Color.WHITE);
        tv.setPadding(20, 6, 20, 0);
        tv.setText(label + ": " + (initial - neutral));
        root.addView(tv);
        SeekBar bar = new SeekBar(this);
        bar.setMax(max - min);
        bar.setProgress(initial - min);
        bar.setOnSeekBarChangeListener(listener);
        root.addView(bar);
        return tv;
    }

    private void rebuildPreview() {
        preview = ImageUtils.applyFilter(original, preset, autoEnhance, brightness, contrast, saturation);
        cropView.setBitmap(preview);
    }

    private void applyAndReturn() {
        try {
            PointF[] quad = cropView.getImageCorners();
            Bitmap cropped = ImageUtils.cropQuad(preview, quad);
            FileResult result = new FileResult(AppStorage.writeBitmap(this, "page", cropped));
            Intent data = new Intent();
            data.putExtra("path", result.file.getAbsolutePath());
            data.putExtra("index", pageIndex);
            setResult(RESULT_OK, data);
            finish();
        } catch (Exception e) {
            Toast.makeText(this, "Save failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private static class FileResult {
        final java.io.File file;
        FileResult(java.io.File file) { this.file = file; }
    }
}
